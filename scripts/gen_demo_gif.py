"""
mdPDF demo GIF generator — Diagram Inserter feature showcase.
Journey: idle → Diagram dropdown → Flowchart → rendered SVG → Sequence → export
"""

from PIL import Image, ImageDraw, ImageFont
import os

# ── Dimensions & palette ─────────────────────────────────────────────────────
W, H = 900, 560
SIDEBAR_W  = 52
EDITOR_W   = 380
PREVIEW_W  = W - SIDEBAR_W - EDITOR_W

BG_APP     = (3,   7,  18)
BG_HEADER  = (15,  23,  42)
BG_EDITOR  = (13,  20,  36)
BG_PREVIEW = (255, 255, 255)
BG_SIDEBAR = (255, 255, 255)
BG_TOOLBAR = (13,  20,  36)

TXT_EDITOR  = (148, 163, 184)
TXT_PREVIEW = (30,  41,  59)
TXT_MUTED   = (100, 116, 139)
TXT_WHITE   = (255, 255, 255)

ACCENT  = (99,  102, 241)
ACCENT2 = (167, 139, 250)
ACCENT3 = (232, 121, 249)

BORDER_D = (30, 41, 59)
BORDER_L = (226, 232, 240)

HEADING_COLOR = (99, 102, 241)
CODE_BG       = (241, 245, 249)
CODE_TXT      = (30,  41,  59)

# ── Fonts ────────────────────────────────────────────────────────────────────
FONT_DIR = "C:/Windows/Fonts/"

def font(name, size):
    for path in [FONT_DIR + name, FONT_DIR + "arial.ttf"]:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()

F_UI_XS  = font("segoeui.ttf",  10)
F_UI_SM  = font("segoeui.ttf",  11)
F_UI_MD  = font("segoeui.ttf",  13)
F_UI_B   = font("segoeuib.ttf", 13)
F_UI_LG  = font("segoeuib.ttf", 15)
F_MONO   = font("CascadiaCode.ttf", 11)
F_MONO_S = font("CascadiaCode.ttf", 10)
F_H1     = font("segoeuib.ttf", 18)
F_H2     = font("segoeuib.ttf", 14)
F_SERIF  = font("georgia.ttf",  22)
F_SERIF_S= font("georgia.ttf",  16)

# ── Helpers ──────────────────────────────────────────────────────────────────
def rr(draw, xy, r, fill=None, outline=None, width=1):
    draw.rounded_rectangle(xy, r, fill=fill, outline=outline, width=width)

def text_w(draw, text, fnt):
    return draw.textbbox((0, 0), text, font=fnt)[2]

def lerp_color(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

# ── Component renderers ───────────────────────────────────────────────────────

def draw_gradient_bar(img, y=0, h=3):
    for x in range(W):
        t = x / (W - 1)
        c = lerp_color(ACCENT, ACCENT2, t * 2) if t < 0.5 else lerp_color(ACCENT2, ACCENT3, (t - 0.5) * 2)
        for dy in range(h):
            img.putpixel((x, y + dy), c)

def draw_header(draw, img, exporting=False):
    draw.rectangle([(0, 3), (W - 1, 54)], fill=BG_HEADER)
    draw.line([(0, 54), (W, 54)], fill=BORDER_D, width=1)

    # Logo
    xi = 16
    draw.text((xi, 18), "md", font=F_SERIF, fill=TXT_WHITE)
    ax = xi + 34
    draw.line([(ax, 30), (ax + 22, 30)], fill=ACCENT, width=2)
    draw.line([(ax + 16, 25), (ax + 22, 30), (ax + 16, 35)], fill=ACCENT, width=2)
    draw.text((ax + 28, 18), "PDF", font=F_SERIF_S, fill=TXT_WHITE)

    # Upload button
    ux = W - 200
    rr(draw, [(ux, 17), (ux + 90, 39)], 4, outline=(60, 70, 90), width=1)
    draw.text((ux + 8, 22), "Upload .md", font=F_UI_XS, fill=TXT_MUTED)

    # Export button
    ex = W - 98
    fill = (55, 48, 163) if exporting else (79, 70, 229)
    label = "Exporting…" if exporting else "Export PDF"
    rr(draw, [(ex, 17), (ex + 82, 39)], 4, fill=fill)
    draw.text((ex + 8, 22), label, font=F_UI_XS, fill=TXT_WHITE)

def draw_panel_labels(draw):
    y0, y1 = 55, 87

    # Sidebar
    draw.rectangle([(0, y0), (SIDEBAR_W, y1)], fill=BG_SIDEBAR)
    draw.line([(SIDEBAR_W, y0), (SIDEBAR_W, y1)], fill=BORDER_L, width=1)
    draw.line([(0, y1), (SIDEBAR_W, y1)], fill=BORDER_L, width=1)

    # Editor label
    ex0, ex1 = SIDEBAR_W, SIDEBAR_W + EDITOR_W
    draw.rectangle([(ex0, y0), (ex1, y1)], fill=BG_EDITOR)
    draw.text((ex0 + 16, y0 + 10), "MARKDOWN", font=F_UI_XS, fill=TXT_MUTED)
    draw.line([(ex0, y1), (ex1, y1)], fill=BORDER_D, width=1)
    draw.line([(ex1, y0), (ex1, y1)], fill=BORDER_D, width=1)

    # Preview label
    px0 = ex1
    draw.rectangle([(px0, y0), (W, y1)], fill=BG_PREVIEW)
    draw.text((px0 + 16, y0 + 10), "PREVIEW", font=F_UI_XS, fill=(148, 163, 184))
    draw.line([(px0, y1), (W, y1)], fill=BORDER_L, width=1)

def draw_sidebar(draw):
    draw.rectangle([(0, 87), (SIDEBAR_W, H)], fill=BG_SIDEBAR)
    draw.line([(SIDEBAR_W, 87), (SIDEBAR_W, H)], fill=BORDER_L, width=1)
    ax = SIDEBAR_W - 14
    ay = 87 + 22
    draw.polygon([(ax, ay), (ax + 8, ay + 6), (ax + 8, ay - 6)], fill=(200, 210, 220))

def draw_toolbar(draw, diagram_active=False):
    """34px format toolbar — includes Diagram button at right."""
    y0, y1 = 88, 122
    x0, x1 = SIDEBAR_W, SIDEBAR_W + EDITOR_W
    draw.rectangle([(x0, y0), (x1, y1)], fill=BG_TOOLBAR)
    draw.line([(x0, y1), (x1, y1)], fill=BORDER_D, width=1)

    alpha = (148, 163, 184)
    dim   = (60,  72,  90)

    bx = x0 + 10
    for ic in ["B", "I", "U", "S"]:
        fnt = F_UI_B if ic == "B" else F_UI_SM
        draw.text((bx + 2, y0 + 9), ic, font=fnt, fill=dim)
        bx += 26

    draw.line([(bx + 4, y0 + 9), (bx + 4, y1 - 9)], fill=(40, 55, 75), width=1)
    bx += 12

    draw.text((bx, y0 + 9), "A", font=F_UI_B, fill=dim)
    draw.line([(bx, y1 - 6), (bx + 10, y1 - 6)], fill=dim, width=2)
    bx += 18
    draw.text((bx, y0 + 9), "H", font=F_UI_B, fill=dim)
    bx += 18

    draw.line([(bx + 2, y0 + 9), (bx + 2, y1 - 9)], fill=(40, 55, 75), width=1)
    bx += 10

    # Font selector
    rr(draw, [(bx, y0 + 9), (bx + 70, y1 - 7)], 3, fill=(18, 26, 44), outline=(50, 65, 85), width=1)
    draw.text((bx + 5, y0 + 11), "Font", font=F_UI_XS, fill=alpha)
    draw.text((bx + 56, y0 + 11), "▾", font=F_UI_XS, fill=alpha)
    bx += 76

    # Size selector
    rr(draw, [(bx, y0 + 9), (bx + 46, y1 - 7)], 3, fill=(18, 26, 44), outline=(50, 65, 85), width=1)
    draw.text((bx + 5, y0 + 11), "Size", font=F_UI_XS, fill=alpha)
    draw.text((bx + 34, y0 + 11), "▾", font=F_UI_XS, fill=alpha)
    bx += 52

    # Diagram button (right-aligned, highlighted when active)
    dbx = x1 - 80
    dbfill = (40, 50, 80) if diagram_active else (25, 35, 58)
    dbborder = ACCENT if diagram_active else (55, 70, 100)
    rr(draw, [(dbx, y0 + 7), (dbx + 70, y1 - 7)], 4, fill=dbfill, outline=dbborder, width=1)
    draw.text((dbx + 6, y0 + 10), "Diagram", font=F_UI_XS, fill=alpha)
    draw.text((dbx + 54, y0 + 10), "▾", font=F_UI_XS, fill=(ACCENT if diagram_active else alpha))

def draw_diagram_dropdown(draw):
    """Dropdown menu below the Diagram button."""
    x0 = SIDEBAR_W + EDITOR_W - 80   # align with button
    y0 = 122
    w  = 140
    items = [
        ("⬡ Flowchart",   True),
        ("⇄ Sequence",    False),
        ("◈ ER Diagram",  False),
        ("◎ State",       False),
        ("▣ Gantt",       False),
        ("◑ Pie Chart",   False),
    ]
    row_h = 26
    total_h = len(items) * row_h + 8

    # shadow
    rr(draw, [(x0 + 3, y0 + 3), (x0 + w + 3, y0 + total_h + 3)], 6, fill=(0, 0, 0, 80))
    # panel
    rr(draw, [(x0, y0), (x0 + w, y0 + total_h)], 6, fill=(20, 30, 55), outline=(55, 70, 100), width=1)

    ty = y0 + 4
    for i, (label, is_hover) in enumerate(items):
        if is_hover:
            rr(draw, [(x0 + 3, ty + 1), (x0 + w - 3, ty + row_h - 1)], 3, fill=(40, 52, 90))
        clr = TXT_WHITE if is_hover else (148, 163, 184)
        draw.text((x0 + 12, ty + 6), label, font=F_UI_SM, fill=clr)
        ty += row_h

def draw_diagram_dropdown_sequence(draw):
    """Dropdown with Sequence hovered."""
    x0 = SIDEBAR_W + EDITOR_W - 80
    y0 = 122
    w  = 140
    items = [
        ("⬡ Flowchart",   False),
        ("⇄ Sequence",    True),
        ("◈ ER Diagram",  False),
        ("◎ State",       False),
        ("▣ Gantt",       False),
        ("◑ Pie Chart",   False),
    ]
    row_h = 26
    total_h = len(items) * row_h + 8

    rr(draw, [(x0 + 3, y0 + 3), (x0 + w + 3, y0 + total_h + 3)], 6, fill=(0, 0, 0, 80))
    rr(draw, [(x0, y0), (x0 + w, y0 + total_h)], 6, fill=(20, 30, 55), outline=(55, 70, 100), width=1)

    ty = y0 + 4
    for label, is_hover in items:
        if is_hover:
            rr(draw, [(x0 + 3, ty + 1), (x0 + w - 3, ty + row_h - 1)], 3, fill=(40, 52, 90))
        clr = TXT_WHITE if is_hover else (148, 163, 184)
        draw.text((x0 + 12, ty + 6), label, font=F_UI_SM, fill=clr)
        ty += row_h

def draw_editor(draw, lines, cursor_line=-1):
    x0, x1 = SIDEBAR_W, SIDEBAR_W + EDITOR_W
    y0 = 122
    draw.rectangle([(x0, y0), (x1, H)], fill=BG_EDITOR)
    ty = y0 + 14
    for li, line in enumerate(lines):
        if ty > H - 10:
            break
        if line.startswith("# "):
            clr = (161, 161, 251)
        elif line.startswith("## "):
            clr = (147, 153, 240)
        elif line.startswith("```"):
            clr = (100, 116, 139)
        elif line.startswith("graph ") or line.startswith("sequenceDiagram"):
            clr = (129, 200, 169)   # teal for mermaid keywords
        elif line.startswith("    ") or (li > 0 and lines[0].startswith("```mermaid")):
            clr = (180, 195, 220)
        else:
            clr = TXT_EDITOR
        txt = line
        while txt and text_w(draw, txt, F_MONO_S) > EDITOR_W - 30:
            txt = txt[:-1]
        draw.text((x0 + 20, ty), txt, font=F_MONO_S, fill=clr)
        if li == cursor_line:
            cx = x0 + 20 + text_w(draw, line, F_MONO_S) + 2
            draw.line([(cx, ty), (cx, ty + 13)], fill=(129, 140, 248), width=1)
        ty += 16

def draw_preview_default(draw):
    """Standard markdown preview."""
    x0 = SIDEBAR_W + EDITOR_W
    y0 = 88
    draw.rectangle([(x0, y0), (W, H)], fill=BG_PREVIEW)
    draw.line([(x0, y0), (x0, H)], fill=BORDER_L, width=1)
    tx = x0 + 22
    ty = y0 + 16
    draw.text((tx, ty), "Welcome to mdPDF", font=F_H1, fill=HEADING_COLOR)
    ty += 30
    draw.text((tx, ty), "Start writing Markdown on the left,", font=F_UI_MD, fill=TXT_PREVIEW)
    ty += 20
    draw.text((tx, ty), "your preview appears here instantly.", font=F_UI_MD, fill=TXT_PREVIEW)
    ty += 28
    draw.text((tx, ty), "What's supported", font=F_H2, fill=HEADING_COLOR)
    ty += 22
    for bullet in ["Bold, italic, strikethrough, `code`",
                   "Tables, task lists, blockquotes",
                   "Mermaid diagrams (flowcharts, sequence…)"]:
        draw.ellipse([(tx + 3, ty + 5), (tx + 7, ty + 9)], fill=ACCENT)
        draw.text((tx + 14, ty), bullet, font=F_UI_SM, fill=TXT_PREVIEW)
        ty += 18
    ty += 10
    rr(draw, [(tx - 4, ty), (W - 18, ty + 40)], 4, fill=CODE_BG)
    draw.text((tx + 4, ty + 5),  "function greet(name: string) {", font=F_MONO_S, fill=CODE_TXT)
    draw.text((tx + 4, ty + 20), "  return `Hello, ${name}!`",     font=F_MONO_S, fill=CODE_TXT)

def draw_preview_flowchart(draw):
    """Preview showing a rendered Mermaid flowchart (boxes + arrows)."""
    x0 = SIDEBAR_W + EDITOR_W
    y0 = 88
    draw.rectangle([(x0, y0), (W, H)], fill=BG_PREVIEW)
    draw.line([(x0, y0), (x0, H)], fill=BORDER_L, width=1)

    cx = x0 + PREVIEW_W // 2
    box_w, box_h = 100, 36
    gap = 44

    # Top label
    label = "Flowchart"
    lw = text_w(draw, label, F_H2)
    draw.text((cx - lw // 2, y0 + 12), label, font=F_H2, fill=HEADING_COLOR)

    starts = [y0 + 50, y0 + 50 + box_h + gap, y0 + 50 + (box_h + gap) * 2]

    configs = [
        ("Start",   (220, 242, 220), (52, 168, 83),  (30, 100, 50)),
        ("Process", (225, 226, 255), (99, 102, 241),  (50,  52, 130)),
        ("End",     (226, 232, 240), (100, 116, 139), (50,  70,  90)),
    ]

    for (label, bg, border, tfill), sy in zip(configs, starts):
        bx0 = cx - box_w // 2
        bx1 = bx0 + box_w
        rr(draw, [(bx0, sy), (bx1, sy + box_h)], 8, fill=bg, outline=border, width=2)
        lw = text_w(draw, label, F_UI_B)
        draw.text((cx - lw // 2, sy + 10), label, font=F_UI_B, fill=tfill)

    # Arrows
    for sy in starts[:-1]:
        ay0 = sy + box_h
        ay1 = sy + box_h + gap
        draw.line([(cx, ay0), (cx, ay1 - 6)], fill=(100, 116, 139), width=2)
        draw.polygon([(cx - 5, ay1 - 6), (cx + 5, ay1 - 6), (cx, ay1)], fill=(100, 116, 139))

def draw_preview_sequence(draw):
    """Preview showing a rendered Mermaid sequence diagram."""
    x0 = SIDEBAR_W + EDITOR_W
    y0 = 88
    draw.rectangle([(x0, y0), (W, H)], fill=BG_PREVIEW)
    draw.line([(x0, y0), (x0, H)], fill=BORDER_L, width=1)

    label = "Sequence Diagram"
    lw = text_w(draw, label, F_H2)
    cx = x0 + PREVIEW_W // 2
    draw.text((cx - lw // 2, y0 + 12), label, font=F_H2, fill=HEADING_COLOR)

    # Actor positions
    alice_x = x0 + 60
    bob_x   = x0 + PREVIEW_W - 60
    head_y  = y0 + 52
    line_y0 = head_y + 30
    line_y1 = H - 30

    for actor_x, name in [(alice_x, "Alice"), (bob_x, "Bob")]:
        rr(draw, [(actor_x - 28, head_y), (actor_x + 28, head_y + 24)], 4,
           fill=(225, 226, 255), outline=ACCENT, width=2)
        nw = text_w(draw, name, F_UI_B)
        draw.text((actor_x - nw // 2, head_y + 5), name, font=F_UI_B, fill=(50, 52, 130))
        draw.line([(actor_x, line_y0), (actor_x, line_y1)], fill=(180, 190, 210), width=1)

    # Arrow: Request  Alice → Bob
    req_y = line_y0 + 30
    draw.line([(alice_x, req_y), (bob_x - 6, req_y)], fill=(99, 102, 241), width=2)
    draw.polygon([(bob_x - 6, req_y - 5), (bob_x - 6, req_y + 5), (bob_x, req_y)], fill=(99, 102, 241))
    rmid = (alice_x + bob_x) // 2
    rw = text_w(draw, "Request", F_UI_SM)
    draw.text((rmid - rw // 2, req_y - 16), "Request", font=F_UI_SM, fill=(99, 102, 241))

    # Dashed arrow: Response  Bob → Alice
    resp_y = req_y + 60
    dash_len = 7
    x = bob_x
    while x > alice_x + 6:
        draw.line([(x, resp_y), (max(x - dash_len, alice_x + 6), resp_y)], fill=(148, 163, 184), width=2)
        x -= dash_len * 2
    draw.polygon([(alice_x + 6, resp_y - 5), (alice_x + 6, resp_y + 5), (alice_x, resp_y)], fill=(148, 163, 184))
    rw2 = text_w(draw, "Response", F_UI_SM)
    draw.text((rmid - rw2 // 2, resp_y - 16), "Response", font=F_UI_SM, fill=(100, 116, 139))

    # Bottom actor boxes (mirrored)
    for actor_x, name in [(alice_x, "Alice"), (bob_x, "Bob")]:
        rr(draw, [(actor_x - 28, line_y1), (actor_x + 28, line_y1 + 24)], 4,
           fill=(225, 226, 255), outline=ACCENT, width=2)
        nw = text_w(draw, name, F_UI_B)
        draw.text((actor_x - nw // 2, line_y1 + 5), name, font=F_UI_B, fill=(50, 52, 130))

def draw_success_toast(draw):
    tx0 = SIDEBAR_W + EDITOR_W + 30
    ty0 = H - 62
    rr(draw, [(tx0, ty0), (W - 18, ty0 + 36)], 6, fill=(22, 163, 74))
    draw.text((tx0 + 14, ty0 + 10), "✓  PDF exported successfully", font=F_UI_MD, fill=TXT_WHITE)

# ── make_frame ────────────────────────────────────────────────────────────────
def make_frame(
    editor_lines=None,
    cursor_line=-1,
    diagram_active=False,
    show_dropdown=False,
    show_dropdown_seq=False,
    preview_mode="default",   # "default" | "flowchart" | "sequence"
    exporting=False,
    show_success=False,
):
    img  = Image.new("RGB", (W, H), BG_APP)
    draw = ImageDraw.Draw(img)

    draw_gradient_bar(img)
    draw_header(draw, img, exporting=exporting)
    draw_panel_labels(draw)
    draw_sidebar(draw)
    draw_toolbar(draw, diagram_active=diagram_active)
    draw_editor(draw, editor_lines or [], cursor_line=cursor_line)

    if preview_mode == "flowchart":
        draw_preview_flowchart(draw)
    elif preview_mode == "sequence":
        draw_preview_sequence(draw)
    else:
        draw_preview_default(draw)

    if show_dropdown:
        draw_diagram_dropdown(draw)
    if show_dropdown_seq:
        draw_diagram_dropdown_sequence(draw)

    if show_success:
        draw_success_toast(draw)

    return img


# ── Editor content ────────────────────────────────────────────────────────────
LINES_BASE = [
    "# Welcome to mdPDF",
    "",
    "Start writing **Markdown** on the left,",
    "your preview appears here instantly.",
    "",
    "## What's supported",
    "",
    "- Bold, italic, ~~strike~~, `code`",
    "- Tables, task lists, blockquotes",
    "- Mermaid diagrams",
]

LINES_FLOWCHART = [
    "# Welcome to mdPDF",
    "",
    "## Diagram",
    "",
    "```mermaid",
    "graph TD",
    "    A[Start] --> B[Process]",
    "    B --> C[End]",
    "```",
    "",
    "- Tables, task lists, blockquotes",
]

LINES_SEQUENCE = [
    "# Welcome to mdPDF",
    "",
    "## Diagram",
    "",
    "```mermaid",
    "sequenceDiagram",
    "    Alice->>Bob: Request",
    "    Bob-->>Alice: Response",
    "```",
    "",
    "- Tables, task lists",
]

# ── Scene list ────────────────────────────────────────────────────────────────
scenes = [
    # 1. App idle (1.5s)
    dict(ms=1500, state=dict(editor_lines=LINES_BASE, cursor_line=9, preview_mode="default")),

    # 2. Click "Diagram" button — dropdown opens (0.8s)
    dict(ms=800,  state=dict(editor_lines=LINES_BASE, cursor_line=9, diagram_active=True, show_dropdown=True, preview_mode="default")),

    # 3. Click "Flowchart" — dropdown closes, template in editor (0.6s)
    dict(ms=600,  state=dict(editor_lines=LINES_FLOWCHART, cursor_line=8, preview_mode="default")),

    # 4. Preview renders flowchart SVG (1.2s)
    dict(ms=1200, state=dict(editor_lines=LINES_FLOWCHART, cursor_line=8, preview_mode="flowchart")),

    # 5. Click "Diagram" again — dropdown opens (0.6s)
    dict(ms=600,  state=dict(editor_lines=LINES_FLOWCHART, cursor_line=8, diagram_active=True, show_dropdown_seq=True, preview_mode="flowchart")),

    # 6. Click "Sequence" — template inserts (0.5s)
    dict(ms=500,  state=dict(editor_lines=LINES_SEQUENCE, cursor_line=8, preview_mode="flowchart")),

    # 7. Preview shows sequence diagram (1.2s)
    dict(ms=1200, state=dict(editor_lines=LINES_SEQUENCE, cursor_line=8, preview_mode="sequence")),

    # 8. Export PDF click (0.5s)
    dict(ms=500,  state=dict(editor_lines=LINES_SEQUENCE, exporting=True, preview_mode="sequence")),

    # 9. Success toast (1.5s)
    dict(ms=1500, state=dict(editor_lines=LINES_SEQUENCE, show_success=True, preview_mode="sequence")),

    # 10. Loop back to idle (0.8s)
    dict(ms=800,  state=dict(editor_lines=LINES_BASE, cursor_line=9, preview_mode="default")),
]

# ── Render ────────────────────────────────────────────────────────────────────
print("Rendering frames…")
frames    = [make_frame(**s["state"]) for s in scenes]
durations = [s["ms"] for s in scenes]

print("Quantizing…")
quant = [f.quantize(colors=128, method=Image.Quantize.MEDIANCUT) for f in frames]

out = "demo.gif"
print(f"Saving {out}…")
quant[0].save(
    out,
    save_all=True,
    append_images=quant[1:],
    duration=durations,
    loop=0,
    optimize=True,
)

size_mb = os.path.getsize(out) / 1_000_000
print(f"Done → {out}  ({size_mb:.2f} MB, {len(frames)} frames)")

if size_mb > 5:
    print("Over 5 MB budget — re-quantizing to 64 colors…")
    quant64 = [f.quantize(colors=64, method=Image.Quantize.MEDIANCUT) for f in frames]
    quant64[0].save(
        out, save_all=True, append_images=quant64[1:],
        duration=durations, loop=0, optimize=True,
    )
    size_mb = os.path.getsize(out) / 1_000_000
    print(f"Re-saved → {size_mb:.2f} MB")

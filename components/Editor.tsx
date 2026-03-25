'use client'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onSelect: (start: number, end: number) => void
}

export default function Editor({ value, onChange, textareaRef, onSelect }: EditorProps) {
  return (
    <textarea
      ref={textareaRef}
      className="w-full h-full resize-none outline-none border-none bg-transparent leading-relaxed editor-scroll"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onSelect={(e) => {
        const t = e.currentTarget
        onSelect(t.selectionStart, t.selectionEnd)
      }}
      spellCheck={false}
      dir="auto"
      style={{
        fontFamily: 'var(--font-fira), Menlo, monospace',
        fontSize: '13.5px',
        lineHeight: '1.75',
        color: '#94a3b8',
        padding: '20px 24px',
        caretColor: '#818cf8',
        overflowY: 'auto',
        height: '100%',
      }}
    />
  )
}

'use client'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export default function Editor({ value, onChange }: EditorProps) {
  return (
    <textarea
      className="w-full h-full resize-none p-4 font-mono text-sm outline-none border-none bg-gray-50"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
    />
  )
}

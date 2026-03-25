'use client'

import MonacoEditor from '@monaco-editor/react'

interface EditorProps {
  value: string
  onChange: (value: string) => void
}

export default function Editor({ value, onChange }: EditorProps) {
  return (
    <MonacoEditor
      height="100%"
      language="markdown"
      value={value}
      onChange={(v) => onChange(v ?? '')}
      options={{
        minimap: { enabled: false },
        wordWrap: 'on',
        lineNumbers: 'off',
        folding: false,
        fontSize: 14,
        scrollBeyondLastLine: false,
      }}
      theme="vs-light"
    />
  )
}

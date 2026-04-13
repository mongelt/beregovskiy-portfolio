'use client'

import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import '@/lib/blocknote/styles/theme.css'
import { schema } from '@/lib/blocknote/schema'

interface BlockNoteReadOnlyProps {
  content: any[]
}

export default function BlockNoteReadOnly({ content }: BlockNoteReadOnlyProps) {
  const editor = useCreateBlockNote({
    schema,
    initialContent: content?.length > 0 ? content : undefined,
  })

  return (
    <BlockNoteView
      editor={editor}
      editable={false}
      slashMenu={false}
      formattingToolbar={false}
      sideMenu={false}
    />
  )
}

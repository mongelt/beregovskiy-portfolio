'use client'

import { useEffect, useRef, useState } from 'react'
import {
  useCreateBlockNote,
  SuggestionMenuController,
  FormattingToolbarController,
  FormattingToolbar,
  getFormattingToolbarItems,
} from '@blocknote/react'
import { BlockNoteView } from '@blocknote/mantine'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import '@/lib/blocknote/styles/theme.css'
import { schema } from '@/lib/blocknote/schema'
import type { CustomBlockNoteEditor, CustomPartialBlock } from '@/lib/blocknote/blocks/types'
import { getCustomSlashMenuItems } from '@/lib/blocknote/ui/slash-menu'
import { getCustomBlockTypeSelectItems } from '@/lib/blocknote/ui/block-type-select'
import { CustomSideMenuController } from '@/lib/blocknote/ui/column-drag-menu'
import {
  EmbedReplaceUrlButton,
  EmbedCaptionButton,
  FileCaptionButtonForNonEmbed,
  FileReplaceButtonForNonEmbed,
} from '@/lib/blocknote/ui/embed-toolbar'
import {
  ButtonOutputTypeButton,
  ButtonTextColorButton,
  ButtonBgColorButton,
  ButtonAlignButtons,
  ButtonWidthButton,
} from '@/lib/blocknote/ui/button-toolbar'
import {
  LinkPreviewUrlButton,
  LinkPreviewAlignButtons,
  LinkPreviewDescriptionButton,
} from '@/lib/blocknote/ui/link-preview-toolbar'
import { TagInsertButton } from '@/lib/blocknote/inline-content/tag'
import {
  AudioReplaceUrlButton,
  AudioCaptionButton,
} from '@/lib/blocknote/ui/audio-toolbar'
import { BlockPaddingButton } from '@/lib/blocknote/ui/padding-toolbar'

// BlockNote format is an array of PartialBlock (using custom schema types)
type BlockNoteFormat = CustomPartialBlock[]

interface BlockNoteEditorProps {
  data?: BlockNoteFormat
  onChange?: (data: BlockNoteFormat) => void
  onReady?: (editor: CustomBlockNoteEditor) => void
  holder?: string // For compatibility with EditorJS interface, not used by BlockNote
}

export default function BlockNoteEditorComponent({ 
  data, 
  onChange, 
  onReady, 
  holder 
}: BlockNoteEditorProps) {
  const editorRef = useRef<CustomBlockNoteEditor | null>(null)
  const onReadyRef = useRef(onReady)
  const onChangeRef = useRef(onChange)
  const [isReady, setIsReady] = useState(false)
  const lastDataRef = useRef<string | null>(null)
  const isInitializingRef = useRef(false)
  const isInternalChangeRef = useRef(false) // Track if change is from user input (internal) vs external prop

  // Update refs when props change
  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Helper function to detect if data is EditorJS format
  const isEditorJSFormat = (data: any): boolean => {
    if (!data || !Array.isArray(data)) {
      // EditorJS format has { blocks: [...] } structure
      if (data && typeof data === 'object' && 'blocks' in data && Array.isArray(data.blocks)) {
        return true
      }
    }
    return false
  }

  // Filter out EditorJS format data - will be migrated in Phase 6
  const blockNoteData = data && isEditorJSFormat(data) ? undefined : data

  // Create editor instance - only create once, use initialContent for first load
  // Pass custom schema to useCreateBlockNote (per custom-schemas/index.mdx lines 96-102)
  const editor = useCreateBlockNote({
    schema,
    initialContent: blockNoteData || undefined,
  })

  // Store editor reference
  useEffect(() => {
    if (editor && !editorRef.current) {
      editorRef.current = editor
    }
  }, [editor])

  // Handle onReady callback - fire when editor is ready
  useEffect(() => {
    if (editor && !isReady && !isInitializingRef.current) {
      isInitializingRef.current = true
      // Editor is ready when it's created
      setIsReady(true)
      if (onReadyRef.current) {
        onReadyRef.current(editor)
      }
    }
  }, [editor, isReady])

  // Handle onChange callback using BlockNote's native editor.onChange() method
  useEffect(() => {
    if (!editor || !onChangeRef.current) return

    const handleChange = () => {
      if (onChangeRef.current && editor) {
        // Mark this as an internal change (from user input)
        isInternalChangeRef.current = true
        
        // Get current blocks from editor
        const blocks = editor.document
        if (blocks) {
          onChangeRef.current(blocks)
        }
        
        // Reset flag after a short delay to allow state updates to propagate
        setTimeout(() => {
          isInternalChangeRef.current = false
        }, 0)
      }
    }

    // Subscribe to editor changes
    editor.onChange(handleChange)

    // Cleanup: BlockNote handles unsubscribe internally
    return () => {
      // Note: BlockNote's onChange doesn't return unsubscribe, but cleanup is handled
    }
  }, [editor])

  // Handle initial content loading when data prop changes (after initial load)
  // Only update if change is from external source, not from user input
  useEffect(() => {
    if (!editor || !data || !isReady) return
    
    // Skip EditorJS format data - will be migrated in Phase 6
    if (isEditorJSFormat(data)) {
      console.warn('BlockNote: Skipping EditorJS format data. Will be migrated in Phase 6.')
      return
    }
    
    // Skip if this change is from user input (internal)
    if (isInternalChangeRef.current) {
      // Update lastDataRef to match current state to prevent unnecessary updates
      const serialized = JSON.stringify(data)
      lastDataRef.current = serialized
      return
    }

    // Serialize data to avoid unnecessary updates
    const serialized = JSON.stringify(data)
    if (serialized === lastDataRef.current) {
      return
    }
    lastDataRef.current = serialized

    // Replace document content when data prop changes from external source.
    // Deferred with setTimeout to avoid calling flushSync inside a useEffect
    // (BlockNote's replaceBlocks calls flushSync internally).
    setTimeout(() => {
      try {
        editor.replaceBlocks(editor.document, data)
      } catch (error) {
        console.warn('BlockNote: Error replacing blocks:', error)
      }
    }, 0)
  }, [editor, data, isReady])

  return (
    <div className="w-full">
      <BlockNoteView
        editor={editor}
        editable={true}
        slashMenu={false}
        formattingToolbar={false}
        sideMenu={false}
      >
        {/* Replaces the default Formatting Toolbar */}
        <FormattingToolbarController
          formattingToolbar={() => {
            // Detect current block type to swap nest/unnest for alignment controls
            const currentBlockType = editor.getTextCursorPosition().block.type
            const isButtonBlock = currentBlockType === 'button'
            const isLinkPreviewBlock = currentBlockType === 'linkPreview'
            const isAudioBlock = currentBlockType === 'audio'

            const customBlockTypeItems = getCustomBlockTypeSelectItems(editor)
            const items = getFormattingToolbarItems(customBlockTypeItems).flatMap(
              (item) => {
                // Replace file buttons with embed-aware versions.
                if (item.key === 'fileCaptionButton') {
                  return [
                    <EmbedCaptionButton key="embedCaptionButton" />,
                    <FileCaptionButtonForNonEmbed key="fileCaptionButton" />,
                  ]
                }
                if (item.key === 'replaceFileButton') {
                  return [
                    <EmbedReplaceUrlButton key="embedReplaceUrlButton" />,
                    <FileReplaceButtonForNonEmbed key="replaceFileButton" />,
                  ]
                }
                // For button and link-preview blocks: replace nest/unnest with
                // their respective alignment controls.
                if (item.key === 'nestBlockButton') {
                  if (isButtonBlock) return [<ButtonAlignButtons key="buttonAlign" />]
                  if (isLinkPreviewBlock) return [<LinkPreviewAlignButtons key="linkPreviewAlign" />]
                  if (isAudioBlock) return []
                  return [item]
                }
                if (item.key === 'unnestBlockButton') {
                  if (isButtonBlock || isLinkPreviewBlock || isAudioBlock) return []
                  return [item]
                }
                return [item]
              }
            )
            return (
              <FormattingToolbar>
                {items}
                {/* Button block controls — self-hide when non-button block selected */}
                <ButtonWidthButton key="buttonWidth" />
                <ButtonOutputTypeButton key="buttonOutputType" />
                <ButtonTextColorButton key="buttonTextColor" />
                <ButtonBgColorButton key="buttonBgColor" />
                {/* Link preview controls — self-hide when non-linkPreview block selected */}
                <LinkPreviewUrlButton key="linkPreviewUrl" />
                <LinkPreviewDescriptionButton key="linkPreviewDesc" />
                {/* Audio block controls — self-hide when non-audio block selected */}
                <AudioReplaceUrlButton key="audioReplaceUrl" />
                <AudioCaptionButton key="audioCaption" />
                {/* Padding toggle — shows for embed and button blocks */}
                <BlockPaddingButton key="blockPadding" />
                {/* Tag insertion — self-hides when cursor is not in a text block */}
                <TagInsertButton key="tagInsert" />
              </FormattingToolbar>
            )
          }}
        />
        {/* Replaces the default Slash Menu */}
        <SuggestionMenuController
          triggerCharacter="/"
          getItems={async (query) => getCustomSlashMenuItems(editor, query)}
        />
        {/* Custom Side Menu — adds Column Settings in the drag-handle dropdown */}
        <CustomSideMenuController />
      </BlockNoteView>
    </div>
  )
}

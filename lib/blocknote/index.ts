/**
 * BlockNote Customization Framework - Integration File
 * 
 * This file provides a centralized export point for all BlockNote customization
 * framework components, utilities, and types.
 * 
 * This is an organizational convenience file, not required by BlockNote documentation.
 * It makes it easier to import framework components from a single location.
 */

// Schema
export { schema } from './schema'

// Types - Blocks
export type {
  CustomBlockNoteEditor,
  CustomBlock,
  CustomPartialBlock,
} from './blocks/types'

// Types - Inline Content
export type {
  CustomInlineContentEditor,
} from './inline-content/types'

// Inline Content — Text Tag
export { createTag, TagInsertButton } from './inline-content/tag'

// Types - Styles
export type {
  CustomStyleEditor,
} from './styles/types'

// UI Framework - Slash Menu
export { getCustomSlashMenuItems } from './ui/slash-menu'

// UI Framework - Block Type Select
export { getCustomBlockTypeSelectItems } from './ui/block-type-select'

// UI Framework - Side Menu
export { createCustomSideMenu } from './ui/side-menu'

// UI Framework - Drag Handle Menu
export { createCustomDragHandleMenu } from './ui/drag-handle-menu'

// UI Framework - Slash Menu Component
export { createCustomSlashMenuComponent } from './ui/slash-menu-component'

// UI Framework - Button Block Toolbar
export {
  ButtonOutputTypeButton,
  ButtonTextColorButton,
  ButtonBgColorButton,
  ButtonAlignButtons,
  ButtonWidthButton,
} from './ui/button-toolbar'

// UI Framework - Grid Suggestion Menu (Emoji Picker)
export { createCustomGridSuggestionMenu } from './ui/grid-suggestion-menu'

// Utilities - HTML Conversion
export {
  convertHTMLToBlocks,
  convertBlocksToHTMLLossy,
  convertBlocksToFullHTML,
  convertBlocksToHTML,
} from './utils/html-conversion'

// Utilities - PDF Export
export {
  createPDFGenerator,
  convertBlocksToPDF,
  convertBlocksToPDFWithCustomMappings,
} from './utils/pdf-export'

// Utilities - PDF Export Types
export type {
  PDFExportOptions,
  PDFGeneratorOptions,
  PDFCustomMappings,
} from './utils/pdf-export'

// PDF Generator (foundation only)
export {
  PDFGenerator,
  pdfDefaultSchemaMappings,
} from './utils/pdf-generator'

export type {
  PDFSchemaMappings,
} from './utils/pdf-generator'

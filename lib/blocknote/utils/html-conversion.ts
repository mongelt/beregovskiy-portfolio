import { CustomBlockNoteEditor, CustomBlock } from "../blocks/types";

/**
 * HTML Conversion Framework
 * 
 * Provides utility functions for converting between BlockNote blocks and HTML.
 * 
 * Documentation:
 * - HTML Export: docs/blocknote-documentation/docs/features/export/html.mdx
 * - HTML Import: docs/blocknote-documentation/docs/features/import/html.mdx
 * Examples:
 * - Converting blocks to HTML: docs/blocknote-documentation/examples/05-interoperability/01-converting-blocks-to-html/src/App.tsx
 * - Converting blocks from HTML: docs/blocknote-documentation/examples/05-interoperability/02-converting-blocks-from-html/src/App.tsx
 * 
 * Note: HTML conversion is considered "lossy" - some information might be dropped.
 * For non-lossy serialization, use `JSON.stringify(editor.document)` instead.
 */

/**
 * Converts an HTML string to BlockNote blocks.
 * 
 * Uses `editor.tryParseHTMLToBlocks()` to parse HTML into Block objects.
 * Tries to create Block objects from HTML block-level elements and InlineContent
 * objects from HTML inline elements. If BlockNote doesn't recognize an element's tag,
 * it will parse it as a paragraph or plain text.
 * 
 * @param editor - The BlockNote editor instance
 * @param html - The HTML string to convert
 * @returns An array of Block objects parsed from the HTML, or null if parsing fails
 * 
 * @example
 * ```typescript
 * const html = "<p>Hello, <strong>world!</strong></p>";
 * const blocks = convertHTMLToBlocks(editor, html);
 * if (blocks) {
 *   editor.replaceBlocks(editor.document, blocks);
 * }
 * ```
 * 
 * Documentation: docs/blocknote-documentation/docs/features/import/html.mdx (lines 20-27)
 */
export function convertHTMLToBlocks(
  editor: CustomBlockNoteEditor,
  html: string
): CustomBlock[] | null {
  try {
    const blocks = editor.tryParseHTMLToBlocks(html);
    return blocks as CustomBlock[];
  } catch (error) {
    console.error("Failed to convert HTML to blocks:", error);
    return null;
  }
}

/**
 * Converts BlockNote blocks to interoperable HTML (lossy).
 * 
 * Uses `editor.blocksToHTMLLossy()` to export blocks to a simple HTML structure.
 * This method is lossy - some information such as nesting of nodes may be lost
 * in order to export a simple HTML structure that conforms to HTML standards.
 * Children of blocks which aren't list items are un-nested in the output HTML.
 * 
 * Use this method when you need to export blocks to HTML for interoperability
 * with other applications.
 * 
 * @param editor - The BlockNote editor instance
 * @param blocks - Optional array of blocks to convert. If not provided, the entire document is used.
 * @returns An HTML string representation of the blocks
 * 
 * @example
 * ```typescript
 * // Convert entire document
 * const html = convertBlocksToHTMLLossy(editor);
 * 
 * // Convert specific blocks
 * const html = convertBlocksToHTMLLossy(editor, editor.document);
 * ```
 * 
 * Documentation: docs/blocknote-documentation/docs/features/export/html.mdx (lines 45-52)
 */
export function convertBlocksToHTMLLossy(
  editor: CustomBlockNoteEditor,
  blocks?: CustomBlock[]
): string {
  try {
    return editor.blocksToHTMLLossy(blocks);
  } catch (error) {
    console.error("Failed to convert blocks to HTML (lossy):", error);
    return "";
  }
}

/**
 * Converts BlockNote blocks to full BlockNote HTML.
 * 
 * Uses `editor.blocksToFullHTML()` to export blocks with their full HTML structure,
 * the same as BlockNote uses in its rendered HTML.
 * 
 * Use this method for static rendering of documents that have been created in the editor.
 * For the exported HTML to look the same as the editor, make sure to wrap it in the same
 * `div`s that the editor renders, and add the same stylesheets.
 * 
 * @param editor - The BlockNote editor instance
 * @param blocks - Optional array of blocks to convert. If not provided, the entire document is used.
 * @returns An HTML string with full BlockNote HTML structure
 * 
 * @example
 * ```typescript
 * // Convert entire document
 * const html = convertBlocksToFullHTML(editor);
 * 
 * // Convert specific blocks
 * const html = convertBlocksToFullHTML(editor, editor.document);
 * ```
 * 
 * Documentation: docs/blocknote-documentation/docs/features/export/html.mdx (lines 19-33)
 */
export function convertBlocksToFullHTML(
  editor: CustomBlockNoteEditor,
  blocks?: CustomBlock[]
): string {
  try {
    return editor.blocksToFullHTML(blocks);
  } catch (error) {
    console.error("Failed to convert blocks to full HTML:", error);
    return "";
  }
}

/**
 * Convenience function to convert blocks to HTML.
 * 
 * By default, uses `blocksToHTMLLossy` for interoperable HTML.
 * Set `fullHTML: true` to use `blocksToFullHTML` for full BlockNote HTML.
 * 
 * @param editor - The BlockNote editor instance
 * @param blocks - Optional array of blocks to convert. If not provided, the entire document is used.
 * @param options - Conversion options
 * @param options.fullHTML - If true, use `blocksToFullHTML`. If false, use `blocksToHTMLLossy` (default: false)
 * @returns An HTML string representation of the blocks
 * 
 * @example
 * ```typescript
 * // Interoperable HTML (default)
 * const html = convertBlocksToHTML(editor);
 * 
 * // Full BlockNote HTML
 * const html = convertBlocksToHTML(editor, editor.document, { fullHTML: true });
 * ```
 */
export function convertBlocksToHTML(
  editor: CustomBlockNoteEditor,
  blocks?: CustomBlock[],
  options?: { fullHTML?: boolean }
): string {
  if (options?.fullHTML) {
    return convertBlocksToFullHTML(editor, blocks);
  }
  return convertBlocksToHTMLLossy(editor, blocks);
}

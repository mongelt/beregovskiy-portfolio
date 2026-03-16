import { ReactElement } from "react";
import { CustomBlockNoteEditor, CustomBlock } from "../blocks/types";
import {
  PDFGenerator,
  pdfDefaultSchemaMappings,
  PDFCustomMappings,
  PDFExportOptions,
  PDFGeneratorOptions,
} from "./pdf-generator";

/**
 * PDF Export Framework
 * 
 * Provides utility functions for converting BlockNote blocks to PDF documents.
 * 
 * Documentation: docs/blocknote-documentation/docs/features/export/pdf.mdx
 * Example: docs/blocknote-documentation/examples/05-interoperability/05-converting-blocks-to-pdf/src/App.tsx
 * 
 * Note: This uses a custom PDF generator module (`pdf-generator`) instead of `@blocknote/xl-pdf-exporter`.
 * The `@blocknote/xl-pdf-exporter` package is a licensed product (xl- packages are copyleft licensed),
 * so we use our own custom implementation.
 * 
 * Installation required:
 * ```bash
 * npm install @react-pdf/renderer
 * ```
 * 
 * Status: Foundation only - PDF generator implementation will be completed in later phases.
 */

// Re-export types from pdf-generator for convenience
export type {
  PDFExportOptions,
  PDFGeneratorOptions,
  PDFCustomMappings,
} from "./pdf-generator";

/**
 * Creates a PDFGenerator instance for the given editor.
 * 
 * This is a convenience helper function that extracts the schema from the editor
 * and creates a PDFGenerator with default or custom mappings.
 * 
 * @param editor - The BlockNote editor instance
 * @param customMappings - Optional custom schema mappings for custom blocks/inline content/styles
 * @param generatorOptions - Optional generator options (emojiSource, resolveFileUrl, colors)
 * @returns A PDFGenerator instance
 * 
 * @example
 * ```typescript
 * // With default mappings
 * const generator = createPDFGenerator(editor);
 * 
 * // With custom block mapping
 * const generator = createPDFGenerator(editor, {
 *   blockMapping: {
 *     ...pdfDefaultSchemaMappings.blockMapping,
 *     myCustomBlock: (block, generator) => <Text>My custom block</Text>,
 *   },
 * });
 * ```
 * 
 * Documentation: docs/blocknote-documentation/docs/features/export/pdf.mdx (lines 19-35, 62-84, 86-105)
 * 
 * Note: This is a foundation only - full implementation will be completed in later phases.
 */
export function createPDFGenerator(
  editor: CustomBlockNoteEditor,
  customMappings?: PDFCustomMappings,
  generatorOptions?: PDFGeneratorOptions
): PDFGenerator {
  // Merge custom mappings with default mappings
  const mappings = customMappings
    ? {
        blockMapping: {
          ...pdfDefaultSchemaMappings.blockMapping,
          ...customMappings.blockMapping,
        },
        inlineContentMapping: {
          ...pdfDefaultSchemaMappings.inlineContentMapping,
          ...customMappings.inlineContentMapping,
        },
        styleMapping: {
          ...pdfDefaultSchemaMappings.styleMapping,
          ...customMappings.styleMapping,
        },
      }
    : pdfDefaultSchemaMappings;

  // Create PDFGenerator with editor.schema (not editor directly) and mappings
  // Per documentation pattern: new PDFGenerator(editor.schema, mappings, options)
  return new PDFGenerator(editor.schema, mappings, generatorOptions);
}

/**
 * Converts BlockNote blocks to a React PDF document.
 * 
 * Uses `PDFGenerator.toReactPDFDocument()` to convert blocks to a React-PDF document
 * that can be rendered or downloaded.
 * 
 * @param editor - The BlockNote editor instance
 * @param blocks - Optional array of blocks to convert. If not provided, the entire document is used.
 * @param options - Optional PDF export options (header, footer)
 * @returns A Promise that resolves to a React PDF document (ReactElement)
 * 
 * @example
 * ```typescript
 * // Convert entire document
 * const pdfDocument = await convertBlocksToPDF(editor);
 * 
 * // Convert specific blocks with custom header/footer
 * const pdfDocument = await convertBlocksToPDF(editor, editor.document, {
 *   header: <Text>My Header</Text>,
 *   footer: <Text>My Footer</Text>,
 * });
 * 
 * // Use with react-pdf to render or download
 * import { pdf, PDFViewer } from "@react-pdf/renderer";
 * 
 * // Render in viewer
 * <PDFViewer>
 *   {pdfDocument}
 * </PDFViewer>
 * 
 * // Download as file
 * const blob = await pdf(pdfDocument).toBlob();
 * ```
 * 
 * Documentation: docs/blocknote-documentation/docs/features/export/pdf.mdx (lines 38-42, 50-60)
 * 
 * Note: This is a foundation only - full implementation will be completed in later phases.
 */
export async function convertBlocksToPDF(
  editor: CustomBlockNoteEditor,
  blocks?: CustomBlock[],
  options?: PDFExportOptions
): Promise<ReactElement | null> {
  try {
    // Create generator with default mappings
    const generator = createPDFGenerator(editor);

    // Convert blocks to React PDF document
    // Use editor.document if blocks not provided
    const blocksToConvert = blocks || editor.document;
    const pdfDocument = await generator.toReactPDFDocument(
      blocksToConvert,
      options
    );

    return pdfDocument;
  } catch (error) {
    console.error("Failed to convert blocks to PDF:", error);
    return null;
  }
}

/**
 * Converts BlockNote blocks to PDF with custom schema mappings.
 * 
 * Use this function when you have custom blocks, inline content, or styles
 * that need custom PDF rendering.
 * 
 * @param editor - The BlockNote editor instance
 * @param blocks - Optional array of blocks to convert. If not provided, the entire document is used.
 * @param customMappings - Custom schema mappings for custom blocks/inline content/styles
 * @param options - Optional PDF export options (header, footer) and generator options
 * @returns A Promise that resolves to a React PDF document (ReactElement)
 * 
 * @example
 * ```typescript
 * import { Text } from "@react-pdf/renderer";
 * 
 * const pdfDocument = await convertBlocksToPDFWithCustomMappings(
 *   editor,
 *   editor.document,
 *   {
 *     blockMapping: {
 *       ...pdfDefaultSchemaMappings.blockMapping,
 *       myCustomBlock: (block, generator) => <Text>My custom block</Text>,
 *     },
 *   },
 *   {
 *     header: <Text>Header</Text>,
 *     footer: <Text>Footer</Text>,
 *   }
 * );
 * ```
 * 
 * Documentation: docs/blocknote-documentation/docs/features/export/pdf.mdx (lines 62-84)
 * 
 * Note: This is a foundation only - full implementation will be completed in later phases.
 */
export async function convertBlocksToPDFWithCustomMappings(
  editor: CustomBlockNoteEditor,
  blocks?: CustomBlock[],
  customMappings?: PDFCustomMappings,
  options?: PDFExportOptions & { generatorOptions?: PDFGeneratorOptions }
): Promise<ReactElement | null> {
  try {
    // Create generator with custom mappings
    const generator = createPDFGenerator(
      editor,
      customMappings,
      options?.generatorOptions
    );

    // Convert blocks to React PDF document
    // Use editor.document if blocks not provided
    const blocksToConvert = blocks || editor.document;
    const pdfDocument = await generator.toReactPDFDocument(blocksToConvert, {
      header: options?.header,
      footer: options?.footer,
    });

    return pdfDocument;
  } catch (error) {
    console.error("Failed to convert blocks to PDF with custom mappings:", error);
    return null;
  }
}

# PDF Generator

Custom PDF generator module to replace `@blocknote/xl-pdf-exporter`.

## Overview

This module provides PDF export functionality for BlockNote blocks without licensing restrictions. The `@blocknote/xl-pdf-exporter` package is a licensed product (xl- packages are copyleft licensed), so this custom implementation provides similar functionality.

## Status

**Foundation Only** - This module currently contains only the foundation/structure. Full implementation will be completed in later phases.

## Structure

- `index.ts` - Main module file with PDFGenerator class and type definitions
- `README.md` - This file

## TODO

- [ ] Implement default schema mappings for all standard BlockNote blocks
- [ ] Implement default schema mappings for all standard BlockNote inline content
- [ ] Implement default schema mappings for all standard BlockNote styles
- [ ] Implement `PDFGenerator.toReactPDFDocument()` method
- [ ] Add support for custom blocks, inline content, and styles
- [ ] Add emoji support
- [ ] Add file URL resolution for CORS issues
- [ ] Add color theme support

## Usage (Future)

Once implemented, this module will be used by `lib/blocknote/utils/pdf-export.ts` to provide PDF export functionality.

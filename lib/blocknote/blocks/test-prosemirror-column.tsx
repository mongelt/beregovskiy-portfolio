/**
 * TEST FILE: ProseMirror Extension Test for Column Block
 * 
 * This is a test implementation to verify if ProseMirror extensions/plugins
 * are needed for blocks with children that require custom DOM structure.
 * 
 * Based on failed attempt notes:
 * - Children render as siblings to react-renderer, not inside custom containers
 * - Official multi-column package uses ProseMirror extensions/plugins
 * - Need to test if ProseMirror Plugin can control DOM structure
 * 
 * Documentation:
 * - Extensions API: docs/blocknote-documentation/docs/features/extensions.mdx
 * - ProseMirror Plugin: https://prosemirror.net/docs/ref/#state.Plugin_System
 */

import { createReactBlockSpec } from "@blocknote/react";
// ProseMirror packages are available as dependencies of @blocknote packages
// Based on example: docs/blocknote-documentation/examples/07-collaboration/07-ghost-writer/src/App.tsx
// eslint-disable-next-line import/no-extraneous-dependencies
import { Plugin, PluginKey } from "prosemirror-state";

/**
 * Test: Create a simple column block with ProseMirror extension
 * to see if we can control where children render
 */
export const createTestColumn = createReactBlockSpec(
  {
    type: "testColumn",
    propSchema: {
      width: {
        default: 1.0,
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      return (
        <div
          className={"test-column"}
          data-column-width={props.block.props.width}
          data-content-type="testColumn"
          id={`test-column-${props.block.id}`}
        >
          {/* Test: Will children render here automatically, or do we need ProseMirror? */}
        </div>
      );
    },
  },
  [
    // Third parameter: Extensions array
    // Test: Create a ProseMirror Plugin to manipulate DOM structure
    // Based on ShowSelection example structure
    // Note: Extension structure per BlockNoteExtension.ts interface
    {
      key: "testColumnExtension",
      prosemirrorPlugins: [
        new Plugin({
          key: new PluginKey("testColumnPlugin"),
          view: (editorView) => {
            // ProseMirror Plugin view - can manipulate DOM
            // This is where we might need to control children rendering
            console.log("Test Column Plugin view created", editorView);
            
            return {
              update: (view, prevState) => {
                // Called when editor state changes
                // Test: Can we find our column container and observe where children actually render
                const columnElement = document.querySelector(
                  `[data-content-type="testColumn"]`
                );
                if (columnElement) {
                  // Find our actual custom div inside the wrapper
                  const customDiv = columnElement.querySelector('.test-column');
                  
                  // Check what's inside our custom div
                  const insideCustomDiv = customDiv?.children;
                  
                  // Check what's at the same level (siblings to the block)
                  const blockOuter = columnElement.closest('.bn-block-outer');
                  const nextBlockOuter = blockOuter?.nextElementSibling;
                  
                  console.log("=== Test Column DOM Analysis ===");
                  console.log("Column wrapper:", columnElement);
                  console.log("Custom div (.test-column):", customDiv);
                  console.log("Inside custom div:", insideCustomDiv);
                  console.log("Block outer:", blockOuter);
                  console.log("Next block (potential child):", nextBlockOuter);
                  console.log("Next block type:", nextBlockOuter?.querySelector('[data-content-type]')?.getAttribute('data-content-type'));
                }
              },
              destroy: () => {
                console.log("Test Column Plugin destroyed");
              },
            };
          },
        }),
      ],
    },
  ]
);

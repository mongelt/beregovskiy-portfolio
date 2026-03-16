import {
  BlockColorsItem,
  DragHandleMenu,
  RemoveBlockItem,
} from "@blocknote/react";
import type { ReactNode } from "react";

/**
 * Drag Handle Menu Framework
 * 
 * Provides a factory function to create custom drag handle menu components that can be extended
 * with custom menu items.
 * 
 * Documentation: docs/blocknote-documentation/docs/react/components/side-menu.mdx
 * Example: docs/blocknote-documentation/examples/03-ui-components/05-side-menu-drag-handle-items/src/App.tsx
 * 
 * Note: Per documentation, it's good practice to define custom drag handle menu in a separate
 * component, instead of inline within the sideMenu prop of SideMenuController.
 */

/**
 * Creates a custom drag handle menu component.
 * 
 * Initially returns default drag handle menu items (RemoveBlockItem, BlockColorsItem).
 * Custom items can be added by extending this function or by modifying the returned component.
 * 
 * This component is designed to be used with SideMenu's dragHandleMenu prop.
 * 
 * @returns React component for the drag handle menu
 * 
 * Usage in SideMenu:
 * ```typescript
 * <SideMenu {...props} dragHandleMenu={createCustomDragHandleMenu} />
 * ```
 * 
 * Example pattern (from side-menu-drag-handle-items example):
 * ```typescript
 * const CustomDragHandleMenu = () => (
 *   <DragHandleMenu>
 *     <RemoveBlockItem>Delete</RemoveBlockItem>
 *     <BlockColorsItem>Colors</BlockColorsItem>
 *     <CustomItem>Custom Action</CustomItem>
 *   </DragHandleMenu>
 * );
 * ```
 */
export function createCustomDragHandleMenu(): ReactNode {
  return (
    <DragHandleMenu>
      {/* Default drag handle menu items */}
      <RemoveBlockItem>Delete</RemoveBlockItem>
      <BlockColorsItem>Colors</BlockColorsItem>
      
      {/* TODO: Add custom drag handle menu items here as needed */}
      {/* Example pattern:
      <CustomMenuItem>Custom Action</CustomMenuItem>
      */}
    </DragHandleMenu>
  );
}

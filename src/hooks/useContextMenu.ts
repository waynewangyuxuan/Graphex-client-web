import { useState, useCallback } from 'react';

export type ContextMenuType = 'empty' | 'folder' | 'entity' | 'mixed';

interface ContextMenuState {
  x: number;
  y: number;
  type: ContextMenuType;
  itemId?: string;
}

interface UseContextMenuReturn {
  contextMenu: ContextMenuState | null;
  openContextMenu: (e: React.MouseEvent, type: ContextMenuType, itemId?: string) => void;
  closeContextMenu: () => void;
}

export function useContextMenu(): UseContextMenuReturn {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const openContextMenu = useCallback(
    (e: React.MouseEvent, type: ContextMenuType, itemId?: string) => {
      e.preventDefault();
      e.stopPropagation();
      setContextMenu({ x: e.clientX, y: e.clientY, type, itemId });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  return {
    contextMenu,
    openContextMenu,
    closeContextMenu,
  };
}

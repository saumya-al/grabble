import React, { useState, useEffect } from 'react';
import type { Tile, Position } from '../types';
import { getPlayerColor } from '../utils/playerColors';
import { isValidWordLine } from '../word-detection';

interface BoardProps {
  board: (Tile | null)[][];
  selectedPositions: Position[];
  isPlacingTiles: boolean;
  onColumnClick: (column: number) => void;
  onTileDrop?: (x: number, y: number, tileData: { index: number; tile: Tile }) => void;
  onTileRemove?: (x: number, y: number) => void;
  fallingTiles?: Set<string>;
  fallingTileData?: Map<string, { y: number; column: number; delay: number; duration: number }>; // Fall data for stagger and duration
  removingTiles?: Set<string>; // Tiles being removed (flying to rack)
  removingTileData?: Map<string, { dx: number; dy: number }>; // Removal animation data (direction to rack)
  bottomRowShake?: Set<number>; // Columns that should shake at bottom row
  currentPlayerId?: number;
  onWordSelect?: (positions: Position[]) => void;
  tilesPlacedThisTurn?: Position[]; // Tiles placed in current turn (for showing remove button)
  onTileMove?: (fromX: number, fromY: number, toX: number, toY: number) => void; // Move tile within board
  onBlankTileEdit?: (x: number, y: number) => void; // Handler for editing blank tile letter
  palindromeTiles?: Set<string>; // Tile positions to animate for palindrome bonus
  emordnilapTiles?: Set<string>; // Tile positions to animate for emordnilap bonus
  emordnilapPositions?: Position[]; // Word positions for emordnilap movement calculation
  diagonalTiles?: Set<string>; // Tile positions to animate for diagonal bonus
  diagonalPositions?: Position[]; // Word positions for diagonal sequential animation
}

const Board: React.FC<BoardProps> = ({ 
  board, 
  selectedPositions, 
  isPlacingTiles, 
  onColumnClick,
  onTileDrop,
  onTileRemove,
  fallingTiles = new Set(),
  fallingTileData = new Map(),
  removingTiles = new Set(),
  removingTileData = new Map(),
  bottomRowShake = new Set(),
  currentPlayerId,
  onWordSelect,
  tilesPlacedThisTurn = [],
  onTileMove,
  onBlankTileEdit,
  palindromeTiles = new Set(),
  emordnilapTiles = new Set(),
  emordnilapPositions = [],
  diagonalTiles = new Set(),
  diagonalPositions = [],
}) => {
  // Calculate movement deltas for emordnilap animation
  const getEmordnilapMovement = (x: number, y: number): { dx: number; dy: number } => {
    if (emordnilapPositions.length === 0) return { dx: 0, dy: 0 };
    
    // Sort positions to ensure consistent ordering (top-to-bottom, left-to-right)
    // This ensures the reverse mapping is correct
    const sortedPositions = [...emordnilapPositions].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
    
    // Find the index of this position in the sorted word
    const originalIndex = sortedPositions.findIndex(pos => pos.x === x && pos.y === y);
    if (originalIndex === -1) return { dx: 0, dy: 0 };
    
    // Calculate reverse index (where this tile should move to)
    const reverseIndex = sortedPositions.length - 1 - originalIndex;
    const targetPos = sortedPositions[reverseIndex];
    
    // Calculate delta in cell units
    const dx = targetPos.x - x;
    const dy = targetPos.y - y;
    
    return { dx, dy };
  };
  
  // Calculate animation delay for diagonal sequential animation
  const getDiagonalDelay = (x: number, y: number): number => {
    if (diagonalPositions.length === 0) return 0;
    
    // Find the index of this position in the diagonal word
    const index = diagonalPositions.findIndex(pos => pos.x === x && pos.y === y);
    if (index === -1) return 0;
    
    // Calculate delay based on position in sequence (0 to 1)
    return index / (diagonalPositions.length - 1 || 1);
  };
  
  const [dragOverCell, setDragOverCell] = useState<Position | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null); // Track hovered column for highlighting
  const [draggedTilePos, setDraggedTilePos] = useState<Position | null>(null);
  const [draggedTileForRemoval, setDraggedTileForRemoval] = useState<Position | null>(null);
  const [isDraggingWord, setIsDraggingWord] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<Position | null>(null);
  const [dragCurrentPos, setDragCurrentPos] = useState<Position | null>(null);
  // Touch support for mobile word selection
  const [isTouchingWord, setIsTouchingWord] = useState(false);
  const [touchStartPos, setTouchStartPos] = useState<Position | null>(null);
  const [touchCurrentPos, setTouchCurrentPos] = useState<Position | null>(null);
  
  // Helper to get cell position from touch coordinates
  const getCellFromTouch = (e: React.TouchEvent): Position | null => {
    const touch = e.touches[0] || e.changedTouches[0];
    if (!touch) return null;
    
    const boardElement = e.currentTarget.closest('.board');
    if (!boardElement) return null;
    
    const rect = boardElement.getBoundingClientRect();
    const cellSize = rect.width / 7;
    const x = Math.floor((touch.clientX - rect.left) / cellSize);
    const y = Math.floor((touch.clientY - rect.top) / cellSize);
    
    if (x >= 0 && x < 7 && y >= 0 && y < 7) {
      return { x, y };
    }
    return null;
  };

  // Add document-level drop handler to catch drops outside the board
  useEffect(() => {
    const handleDocumentDrop = (e: DragEvent) => {
      // Only handle if we're dragging a tile from the board
      if (draggedTileForRemoval && onTileRemove) {
        const boardContainer = document.querySelector('.board-container');
        if (boardContainer) {
          const rect = boardContainer.getBoundingClientRect();
          const xPos = e.clientX;
          const yPos = e.clientY;
          
          // If dropped outside the board container, remove the tile
          if (xPos < rect.left || xPos > rect.right || yPos < rect.top || yPos > rect.bottom) {
            console.log('Tile dropped outside board, removing:', draggedTileForRemoval);
            onTileRemove(draggedTileForRemoval.x, draggedTileForRemoval.y);
            setDraggedTileForRemoval(null);
          }
        }
      }
    };

    const handleDocumentDragOver = (e: DragEvent) => {
      // Allow drop outside board
      if (draggedTileForRemoval && e.dataTransfer) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }
    };

    document.addEventListener('drop', handleDocumentDrop);
    document.addEventListener('dragover', handleDocumentDragOver);
    return () => {
      document.removeEventListener('drop', handleDocumentDrop);
      document.removeEventListener('dragover', handleDocumentDragOver);
    };
  }, [draggedTileForRemoval, onTileRemove]);

  const isSelected = (x: number, y: number) => {
    return selectedPositions.some(p => p.x === x && p.y === y);
  };

  // Helper to get positions between start and end in a straight line
  const getPositionsBetween = (start: Position, end: Position): Position[] => {
    const positions: Position[] = [];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    
    // Check if it's a valid straight line
    if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) {
      return [start]; // Not a straight line, just return start
    }
    
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    const stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
    const stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
    
    for (let i = 0; i <= steps; i++) {
      positions.push({
        x: start.x + (stepX * i),
        y: start.y + (stepY * i)
      });
    }
    
    return positions;
  };

  const handleMouseDown = (e: React.MouseEvent, x: number, y: number) => {
    // Only start word selection if clicking on a tile (not empty cell)
    if (board[y][x] && !isPlacingTiles) {
      setIsDraggingWord(true);
      setDragStartPos({ x, y });
      setDragCurrentPos({ x, y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent, x: number, y: number) => {
    if (isDraggingWord && dragStartPos) {
      setDragCurrentPos({ x, y });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDraggingWord && dragStartPos && dragCurrentPos && onWordSelect) {
      const positions = getPositionsBetween(dragStartPos, dragCurrentPos);
      // Filter to only positions with tiles
      const validPositions = positions.filter(pos => 
        pos.x >= 0 && pos.x < 7 && pos.y >= 0 && pos.y < 7 && board[pos.y]?.[pos.x]
      );
      
      if (validPositions.length >= 3 && isValidWordLine(validPositions)) {
        // Preserve drag direction (start to end, not sorted)
        onWordSelect(validPositions);
      }
      
      setIsDraggingWord(false);
      setDragStartPos(null);
      setDragCurrentPos(null);
    } else if (isDraggingWord) {
      // Cancel drag if no valid selection
      setIsDraggingWord(false);
      setDragStartPos(null);
      setDragCurrentPos(null);
    }
  };

  // Touch event handlers for mobile word selection
  const handleTouchStart = (e: React.TouchEvent, x: number, y: number) => {
    // Only start word selection if touching a tile (not empty cell)
    if (board[y][x] && !isPlacingTiles) {
      setIsTouchingWord(true);
      setTouchStartPos({ x, y });
      setTouchCurrentPos({ x, y });
      e.preventDefault(); // Prevent scrolling
      e.stopPropagation();
    }
  };

  // Board-level touch move handler to track movement across cells
  const handleBoardTouchMove = (e: React.TouchEvent) => {
    if (isTouchingWord && touchStartPos) {
      const cellPos = getCellFromTouch(e);
      if (cellPos) {
        setTouchCurrentPos(cellPos);
      }
      e.preventDefault(); // Prevent scrolling while selecting
    }
  };

  const handleTouchMove = (e: React.TouchEvent, x: number, y: number) => {
    // This is called per cell, but we'll handle it at board level
    if (isTouchingWord) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, x?: number, y?: number) => {
    // If we were selecting a word, handle word selection
    if (isTouchingWord && touchStartPos && touchCurrentPos) {
      // Check if we actually moved (swipe) vs just tapped
      const moved = touchStartPos.x !== touchCurrentPos.x || touchStartPos.y !== touchCurrentPos.y;
      
      if (moved && onWordSelect) {
        const positions = getPositionsBetween(touchStartPos, touchCurrentPos);
        // Filter to only positions with tiles
        const validPositions = positions.filter(pos => 
          pos.x >= 0 && pos.x < 7 && pos.y >= 0 && pos.y < 7 && board[pos.y]?.[pos.x]
        );
        
        if (validPositions.length >= 3 && isValidWordLine(validPositions)) {
          // Preserve touch direction (start to end, not sorted)
          onWordSelect(validPositions);
        }
      }
      
      setIsTouchingWord(false);
      setTouchStartPos(null);
      setTouchCurrentPos(null);
      e.preventDefault();
      e.stopPropagation();
    } else if (x !== undefined && y !== undefined) {
      // If not selecting word, handle tap-to-place for empty top row cells
      const isEmpty = board[y][x] === null;
      const isTopRow = y === 0;
      if (isEmpty && isTopRow && onColumnClick) {
        e.preventDefault();
        e.stopPropagation();
        onColumnClick(x);
      }
    }
  };

  // Get currently dragging/touching word positions for visual feedback
  const getDraggingWordPositions = (): Position[] => {
    // Check both mouse drag and touch
    const start = isTouchingWord ? touchStartPos : (isDraggingWord ? dragStartPos : null);
    const current = isTouchingWord ? touchCurrentPos : (isDraggingWord ? dragCurrentPos : null);
    
    if (!start || !current) {
      return [];
    }
    return getPositionsBetween(start, current).filter(pos => 
      pos.x >= 0 && pos.x < 7 && pos.y >= 0 && pos.y < 7 && board[pos.y]?.[pos.x]
    );
  };

  const handleDragOver = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCell({ x, y });
  };

  const handleDragEnter = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCell({ x, y });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverCell(null);
    }
  };

  const handleDrop = (e: React.DragEvent, x: number, y: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCell(null);
    
    try {
      const data = e.dataTransfer.getData('text/plain');
      if (data) {
        const parsed = JSON.parse(data);
        // Check if this is a tile from the rack (has index and tile)
        if (parsed.tile && typeof parsed.index === 'number' && onTileDrop) {
          // Always allow drop - tile will fall to lowest empty cell in column via gravity
          onTileDrop(x, y, parsed);
          setDraggedTileForRemoval(null);
        }
        // If dragging a tile from board to another board position
        else if (parsed.fromBoard && parsed.x !== undefined && parsed.y !== undefined) {
          const fromX = parsed.x;
          const fromY = parsed.y;
          // Always clear removal flag when dropping on board
          setDraggedTileForRemoval(null);
          
          // If dropping on a different position, move the tile
          if ((fromX !== x || fromY !== y) && onTileMove) {
            console.log('Moving tile from board:', { fromX, fromY, toX: x, toY: y });
            onTileMove(fromX, fromY, x, y);
          } else {
            console.log('Dropped tile on same position, no move needed');
          }
        }
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleTileDragStart = (e: React.DragEvent, x: number, y: number) => {
    const tile = board[y][x];
    if (!tile) {
      e.preventDefault();
      return;
    }
    
    // Only allow dragging own tiles that were placed this turn
    const wasPlacedThisTurn = tilesPlacedThisTurn.some(pos => pos.x === x && pos.y === y);
    if (!wasPlacedThisTurn || (currentPlayerId !== undefined && tile.playerId !== currentPlayerId)) {
      e.preventDefault();
      return;
    }
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ fromBoard: true, x, y }));
    setDraggedTilePos({ x, y });
    setDraggedTileForRemoval({ x, y }); // Track tile being dragged for removal (in case dropped outside)
  };

  const handleTileDragEnd = (e: React.DragEvent, x: number, y: number) => {
    // Clear drag state
    setDraggedTilePos(null);
    // Note: Removal is handled by document drop handler if dropped outside
    // If dropped inside board, draggedTileForRemoval will be cleared by drop handler
    setTimeout(() => {
      setDraggedTileForRemoval(null);
    }, 100);
  };

  const draggingWordPositions = getDraggingWordPositions();
  const isInDraggingWord = (x: number, y: number) => {
    return draggingWordPositions.some(p => p.x === x && p.y === y);
  };

  // Set CSS variables for cell size (for emordnilap animation)
  const [cellDimensions, setCellDimensions] = useState<{ width: number; height: number }>({ width: 57, height: 57 });
  
  useEffect(() => {
    const boardElement = document.querySelector('.board') as HTMLElement;
    if (boardElement) {
      const boardWidth = boardElement.offsetWidth;
      const boardHeight = boardElement.offsetHeight;
      const cellWidth = boardWidth / 7;
      const cellHeight = boardHeight / 7;
      boardElement.style.setProperty('--cell-width', `${cellWidth}px`);
      boardElement.style.setProperty('--cell-height', `${cellHeight}px`);
      setCellDimensions({ width: cellWidth, height: cellHeight });
    }
  }, [board]);

  return (
    <div className="board-container">
      <div 
        className="board"
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          // Cancel drag if mouse leaves board
          if (isDraggingWord) {
            setIsDraggingWord(false);
            setDragStartPos(null);
            setDragCurrentPos(null);
          }
        }}
        onTouchMove={handleBoardTouchMove}
        onTouchCancel={() => {
          // Cancel touch if touch is cancelled
          if (isTouchingWord) {
            setIsTouchingWord(false);
            setTouchStartPos(null);
            setTouchCurrentPos(null);
          }
        }}
        style={{ touchAction: 'none' }} // Prevent default touch behaviors
      >
        {board.map((row, y) =>
          row.map((cell, x) => {
            const tile = cell;
            const selected = isSelected(x, y);
            const isDragOver = dragOverCell && dragOverCell.x === x && dragOverCell.y === y;
            const isEmpty = tile === null;
            const isTopRow = y === 0;
            const isInDragSelection = isInDraggingWord(x, y);
            
            return (
              <div
                key={`${x}-${y}`}
                className={`cell ${selected ? 'highlighted' : ''} ${isEmpty && isTopRow ? 'drop-zone' : ''} ${isDragOver ? 'drag-over' : ''} ${tile ? 'has-tile' : ''} ${isInDragSelection ? 'word-selecting' : ''} ${bottomRowShake.has(x) && y === 6 ? 'bottom-row-shake' : ''} ${hoveredColumn === x ? 'column-highlight' : ''}`}
                data-x={x}
                data-y={y}
                onMouseEnter={() => {
                  // Highlight entire column when hovering over top row drop zone
                  if (isEmpty && isTopRow) {
                    setHoveredColumn(x);
                  }
                }}
                onMouseLeave={() => {
                  // Only clear if leaving the top row
                  if (isTopRow) {
                    setHoveredColumn(null);
                  }
                }}
                onMouseDown={(e) => handleMouseDown(e, x, y)}
                onMouseMove={(e) => handleMouseMove(e, x, y)}
                onTouchStart={(e) => handleTouchStart(e, x, y)}
                onTouchMove={(e) => handleTouchMove(e, x, y)}
                onTouchEnd={(e) => handleTouchEnd(e, x, y)}
                style={{ touchAction: 'none' }} // Prevent default touch behaviors
                onClick={(e) => {
                  // Prevent click if we just finished a touch selection
                  if (isTouchingWord) {
                    e.preventDefault();
                    return;
                  }
                  if (isEmpty && isTopRow) {
                    onColumnClick(x);
                  }
                  // Don't handle click for word selection - use drag/touch instead
                }}
                onDoubleClick={(e) => {
                  // Double-click to remove tile (only if it's the current player's tile)
                  e.stopPropagation();
                  if (tile && tile.playerId === currentPlayerId && onTileRemove) {
                    console.log('Double-click on cell, removing tile:', { x, y, tile });
                    onTileRemove(x, y);
                  }
                }}
                onDragEnter={(e) => handleDragEnter(e, x, y)}
                onDragOver={(e) => handleDragOver(e, x, y)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, x, y)}
                title={isEmpty && isTopRow ? `Tap to place tile (column ${x + 1})` : tile ? `${tile.letter} (${tile.points} pts) - Swipe to select word, double-tap to remove` : `Cell (${x + 1}, ${y + 1})`}
              >
                {tile ? (
                  <div 
                    draggable={tile.playerId === currentPlayerId && tilesPlacedThisTurn.some(pos => pos.x === x && pos.y === y)}
                    onDragStart={(e) => handleTileDragStart(e, x, y)}
                    onDragEnd={(e) => handleTileDragEnd(e, x, y)}
                    className={`tile ${draggedTilePos && draggedTilePos.x === x && draggedTilePos.y === y ? 'dragging' : ''} ${fallingTiles.has(`${x}-${y}`) ? 'falling' : ''} ${removingTiles.has(`${x}-${y}`) ? 'removing' : ''} ${palindromeTiles.has(`${x}-${y}`) ? 'palindrome' : ''} ${emordnilapTiles.has(`${x}-${y}`) ? 'emordnilap' : ''} ${diagonalTiles.has(`${x}-${y}`) ? 'diagonal' : ''} ${tile.playerId === currentPlayerId ? 'removable' : ''} ${tile.letter === ' ' ? 'blank-tile' : ''}`}
                    style={{ 
                      backgroundColor: getPlayerColor(tile.playerId || 0),
                      color: 'white',
                      border: 'none',
                      borderLeft: `4px solid ${getPlayerColor(tile.playerId || 0)}`,
                      ...(tile.letter === ' ' ? {
                        borderTop: '2px dashed rgba(255, 255, 255, 0.6)',
                        borderRight: '2px dashed rgba(255, 255, 255, 0.6)',
                        borderBottom: '2px dashed rgba(255, 255, 255, 0.6)',
                      } : {}),
                      ...(fallingTiles.has(`${x}-${y}`) ? (() => {
                        const tileData = fallingTileData?.get(`${x}-${y}`);
                        return {
                          '--fall-distance': `${y * 100}%`,
                          '--fall-duration': tileData?.duration ? `${tileData.duration}s` : '0.4s',
                          'animation-delay': tileData?.delay ? `${tileData.delay}s` : '0s'
                        } as React.CSSProperties;
                      })() : {}),
                      ...(removingTiles.has(`${x}-${y}`) ? (() => {
                        const removeData = removingTileData?.get(`${x}-${y}`);
                        return {
                          '--remove-dx': removeData?.dx ? `${removeData.dx}px` : '-200px',
                          '--remove-dy': removeData?.dy ? `${removeData.dy}px` : '-300px'
                        } as React.CSSProperties;
                      })() : {}),
                      ...(emordnilapTiles.has(`${x}-${y}`) ? (() => {
                        const movement = getEmordnilapMovement(x, y);
                        // Get cell dimensions - use state if available, otherwise calculate from board element
                        let cellWidth = cellDimensions.width;
                        let cellHeight = cellDimensions.height;
                        
                        // Fallback: calculate from board element if dimensions not set yet
                        if (cellWidth === 57 && cellHeight === 57) {
                          const boardElement = document.querySelector('.board') as HTMLElement;
                          if (boardElement) {
                            const boardWidth = boardElement.offsetWidth;
                            const boardHeight = boardElement.offsetHeight;
                            cellWidth = boardWidth / 7;
                            cellHeight = boardHeight / 7;
                          }
                        }
                        
                        // Pre-calculate pixel values to handle negative values correctly
                        const translateX = movement.dx * cellWidth;
                        const translateY = movement.dy * cellHeight;
                        
                        // Debug: log movement calculation and pixel values
                        console.log(`🎬 Emordnilap tile at (${x}, ${y}):`, {
                          movement,
                          translateX: `${translateX}px`,
                          translateY: `${translateY}px`,
                          cellWidth,
                          cellHeight,
                          hasEmordnilapClass: emordnilapTiles.has(`${x}-${y}`)
                        });
                        
                        const styleObj = {
                          '--emordnilap-dx': `${movement.dx}`,
                          '--emordnilap-dy': `${movement.dy}`,
                          '--emordnilap-translate-x': `${translateX}px`,
                          '--emordnilap-translate-y': `${translateY}px`
                        } as React.CSSProperties;
                        
                        return styleObj;
                      })() : {}),
                      ...(diagonalTiles.has(`${x}-${y}`) ? (() => {
                        const delay = getDiagonalDelay(x, y);
                        return {
                          '--diagonal-delay': `${delay * 1.5}s` // Total animation is 1.5s, delay based on position
                        } as React.CSSProperties;
                      })() : {})
                    }}
                    onClick={(e) => {
                      // Prevent cell click from firing when clicking on tile
                      e.stopPropagation();
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      const wasPlacedThisTurn = tilesPlacedThisTurn.some(pos => pos.x === x && pos.y === y);
                      
                      // If it's a blank tile and editable, open edit modal
                      if (tile.letter === ' ' && tile.playerId === currentPlayerId && !tile.isBlankLocked && onBlankTileEdit) {
                        console.log('Double-click on blank tile, editing:', { x, y, tile });
                        onBlankTileEdit(x, y);
                        return;
                      }
                      
                      // Otherwise, double-click to remove (only if placed this turn)
                      if (tile.playerId === currentPlayerId && wasPlacedThisTurn && onTileRemove) {
                        console.log('Double-click on tile, removing:', { x, y, tile });
                        onTileRemove(x, y);
                      }
                    }}
                  >
                    {(() => {
                      // Show remove button only if:
                      // 1. Tile belongs to current player
                      // 2. Tile was placed in THIS turn (before submitting)
                      // After turn ends, tiles become non-removable
                      const isCurrentPlayerTile = tile && tile.playerId !== undefined && currentPlayerId !== undefined && tile.playerId === currentPlayerId;
                      const wasPlacedThisTurn = tilesPlacedThisTurn.some(pos => pos.x === x && pos.y === y);
                      const shouldShowRemoveButton = isCurrentPlayerTile && wasPlacedThisTurn && onTileRemove;
                      
                      return shouldShowRemoveButton ? (
                        <button
                          className="remove-tile-btn"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            console.log('Remove button clicked, removing tile:', { x, y, tile, playerId: tile.playerId, currentPlayerId });
                            onTileRemove(x, y);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                          }}
                          title="Remove tile"
                          aria-label="Remove tile"
                        >
                          ×
                        </button>
                      ) : null;
                    })()}
                    <div 
                      className="letter"
                      onClick={(e) => {
                        // Allow clicking blank tiles to edit them (if not locked and belongs to current player)
                        if (tile.letter === ' ' && onBlankTileEdit) {
                          const isEditable = tile.playerId === currentPlayerId && !tile.isBlankLocked;
                          if (isEditable) {
                            e.stopPropagation();
                            onBlankTileEdit(x, y);
                          }
                        }
                      }}
                      style={{
                        cursor: (tile.letter === ' ' && 
                                tile.playerId === currentPlayerId && 
                                !tile.isBlankLocked) 
                                ? 'pointer' : 'default',
                        fontWeight: tile.letter === ' ' && tile.blankLetter ? 'bold' : 'normal',
                        fontSize: tile.letter === ' ' && tile.blankLetter ? '1.1em' : '1em'
                      }}
                      title={tile.letter === ' ' && tile.playerId === currentPlayerId && !tile.isBlankLocked
                        ? 'Click or double-click to edit blank tile letter' 
                        : tile.letter === ' ' && tile.isBlankLocked 
                        ? `Blank tile (locked as ${tile.blankLetter || '?'})` 
                        : tile.letter === ' '
                        ? 'Blank tile'
                        : ''}
                    >
                      {tile.letter === ' ' ? (tile.blankLetter ? tile.blankLetter.toUpperCase() : '?') : tile.letter}
                    </div>
                    <div className="points">{tile.points}</div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Board;


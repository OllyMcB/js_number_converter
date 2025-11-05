import React, { useRef, useState, useCallback } from 'react'
import styles from './NumberInput.module.scss'
import { NumberInputHighlight } from '../../types'

interface Props {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
  type: 'decimal' | 'hex' | 'binary' | 'ascii'
  highlights?: NumberInputHighlight[]
  onMouseMove?: (position: number) => void
  onMouseLeave?: () => void
}

/**
 * @brief A custom input component for number conversion with highlighting
 */
export const NumberInput: React.FC<Props> = ({
  label, 
  value, 
  placeholder, 
  onChange,
  type: _type,
  highlights = [],
  onMouseMove,
  onMouseLeave,
}) => 
{
  const inputRef = useRef<HTMLInputElement>(null)
  const [isSelecting, setIsSelecting] = useState(false)
  
  // Extract input value (before =) and result (after =)
  const parts = value.split('=');
  const input = parts[0];
  const result = parts[1]?.trim();

  // Handle keyboard shortcuts (CMD+A/CTRL+A)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault()
      inputRef.current?.select()
      // Mark as selecting when using keyboard shortcut
      setIsSelecting(true)
    }
  }, [])

  // Helper function to find word/number boundaries at a position
  const findWordBoundaries = useCallback((position: number): { start: number; end: number } => {
    if (!input || position < 0 || position > input.length) {
      return { start: position, end: position }
    }
    
    // Find start of word/number (move backwards until we hit a space or start)
    let start = position
    while (start > 0 && input[start - 1] !== ' ') {
      start--
    }
    
    // Find end of word/number (move forwards until we hit a space or end)
    let end = position
    while (end < input.length && input[end] !== ' ') {
      end++
    }
    
    return { start, end }
  }, [input])

  // Handle double-click to select word/number
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!inputRef.current) return
    
    let clickedPosition: number
    
    // If clicking on a character span, use its position
    const target = e.target as HTMLElement
    if (target.classList.contains(styles.character)) {
      const parent = target.parentElement
      if (!parent) return

      const siblings = Array.from(parent.children)
      const targetIndex = siblings.indexOf(target)
      let position = 0
      
      for (let i = 0; i < targetIndex; i++) {
        const sibling = siblings[i] as HTMLElement
        position += sibling.textContent?.length || 0
      }
      
      clickedPosition = position
    } else {
      // If clicking on overlay (not a character), calculate position from click coordinates
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const x = e.clientX - rect.left
      const charWidth = 8.4
      clickedPosition = Math.floor((x - 20) / charWidth)
    }
    
    const clampedPos = Math.max(0, Math.min(clickedPosition, input.length))
    
    // Find word/number boundaries
    const boundaries = findWordBoundaries(clampedPos)
    
    // Select the word/number
    inputRef.current.focus()
    inputRef.current.setSelectionRange(boundaries.start, boundaries.end)
    setIsSelecting(true)
  }, [input, findWordBoundaries])

  // Handle click on character span or overlay to position cursor
  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't interfere if user has an active selection
    if (inputRef.current) {
      const selectionLength = Math.abs(
        (inputRef.current.selectionEnd || 0) - (inputRef.current.selectionStart || 0)
      )
      if (selectionLength > 0) return
    }
    
    if (!inputRef.current) return
    
    // If clicking on a character span, use its position
    const target = e.target as HTMLElement
    if (target.classList.contains(styles.character)) {
      const parent = target.parentElement
      if (!parent) return

      const siblings = Array.from(parent.children)
      const targetIndex = siblings.indexOf(target)
      let position = 0
      
      for (let i = 0; i < targetIndex; i++) {
        const sibling = siblings[i] as HTMLElement
        position += sibling.textContent?.length || 0
      }
      
      inputRef.current.focus()
      inputRef.current.setSelectionRange(position, position)
      return
    }
    
    // If clicking on overlay (not a character), calculate position from click coordinates
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const charWidth = 8.4 // Approximate width of a character in the monospace font
    const clickedPosition = Math.floor((x - 20) / charWidth) // 20px for padding
    
    inputRef.current.focus()
    inputRef.current.setSelectionRange(
      Math.max(0, Math.min(clickedPosition, input.length)),
      Math.max(0, Math.min(clickedPosition, input.length))
    )
  }, [input])
  
  // Track initial mouse down position for drag detection
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number; inputPos: number } | null>(null)
  
  // Handle mousedown to detect if it's a drag or click
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (inputRef.current) {
      inputRef.current.focus()
      
      // Calculate initial position
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const x = e.clientX - rect.left
      const charWidth = 8.4
      const inputPos = Math.floor((x - 20) / charWidth)
      
      // Store drag start position
      setDragStartPos({ x: e.clientX, y: e.clientY, inputPos: Math.max(0, Math.min(inputPos, input.length)) })
      
      // Set initial cursor position
      inputRef.current.setSelectionRange(
        Math.max(0, Math.min(inputPos, input.length)),
        Math.max(0, Math.min(inputPos, input.length))
      )
    }
  }, [input])
  
  // Handle drag selection
  const handleMouseMoveOnOverlay = useCallback((e: React.MouseEvent) => {
    // If user is holding mouse down and moving, they're selecting
    if (e.buttons === 1 && inputRef.current && dragStartPos) {
      setIsSelecting(true)
      
      // Calculate position from mouse coordinates
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
      const x = e.clientX - rect.left
      const charWidth = 8.4
      const position = Math.floor((x - 20) / charWidth)
      const clampedPos = Math.max(0, Math.min(position, input.length))
      
      // Set selection range from drag start to current position
      if (clampedPos >= dragStartPos.inputPos) {
        inputRef.current.setSelectionRange(dragStartPos.inputPos, clampedPos)
      } else {
        inputRef.current.setSelectionRange(clampedPos, dragStartPos.inputPos)
      }
    }
  }, [input, dragStartPos])
  
  // Handle mouse up - clear drag state
  const handleMouseUp = useCallback(() => {
    setDragStartPos(null)
  }, [])

  // Track mouse down on input to detect selection state
  const handleInputMouseDown = useCallback(() => {
    setIsSelecting(true)
  }, [])

  // Track mouse up on input
  const handleInputMouseUp = useCallback(() => {
    // Use setTimeout to check selection after browser has updated it
    setTimeout(() => {
      if (inputRef.current) {
        const selectionLength = Math.abs(
          (inputRef.current.selectionEnd || 0) - (inputRef.current.selectionStart || 0)
        )
        // If there's no selection, user was just clicking (not dragging)
        if (selectionLength === 0) {
          setIsSelecting(false)
        } else {
          // Keep isSelecting true if there's still a selection
          setIsSelecting(true)
        }
      }
    }, 0)
  }, [])
  
  // Also check selection state when input loses focus (user clicked away)
  const handleInputBlur = useCallback(() => {
    setIsSelecting(false)
  }, [])

  // Handle hover highlighting on character spans (only when not selecting)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLSpanElement>) => {
    // Only trigger hover highlighting if user is not actively selecting text
    if (isSelecting) return
    if (!onMouseMove) return
    
    // Check if there's an active text selection (from keyboard shortcuts, etc.)
    if (inputRef.current) {
      const selectionLength = Math.abs(
        (inputRef.current.selectionEnd || 0) - (inputRef.current.selectionStart || 0)
      )
      if (selectionLength > 0) return
    }

    const target = e.target as HTMLSpanElement
    const parent = target.parentElement
    if (!parent) return

    // Calculate actual character position by summing lengths of all previous siblings
    const siblings = Array.from(parent.children)
    const targetIndex = siblings.indexOf(target)
    let position = 0
    
    for (let i = 0; i < targetIndex; i++) {
      const sibling = siblings[i] as HTMLElement
      position += sibling.textContent?.length || 0
    }
    
    onMouseMove(position)
  }, [isSelecting, onMouseMove])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    // Reset selection state when user types (selection is cleared)
    setIsSelecting(false)
  };

  const renderCharacters = () => {
    if (!input) {
      return <span className={styles.placeholder}>{placeholder}</span>;
    }

    const chars = input.split('');
    return chars.map((char, index) => {
      const highlight = highlights.find(h => index >= h.start && index < h.end);
      const style = highlight ? { color: highlight.color } : undefined;

      return (
        <span
          key={index}
          className={styles.character}
          style={style}
          onMouseMove={handleMouseMove}
          onMouseLeave={onMouseLeave}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputContainer}>
        <div className={styles.displayContainer}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onMouseDown={handleInputMouseDown}
            onMouseUp={handleInputMouseUp}
            onBlur={handleInputBlur}
            className={styles.hiddenInput}
            placeholder={placeholder}
            style={{ caretColor: 'var(--text-primary)' }}
          />
          <div 
            className={styles.characters}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMoveOnOverlay}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
          >
            <div className={styles.content}>
              <div className={styles.input}>
                {renderCharacters()}
              </div>
              {result && (
                <div className={styles.result}>
                  = {result}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 

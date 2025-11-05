import React, { useRef, useState, useCallback } from 'react'
import styles from './NumberInput.module.scss'

interface NumberInputHighlight {
  start: number
  end: number
  color: string
}

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

  // Handle keyboard shortcuts (CMD+A/CTRL+A)
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault()
      inputRef.current?.select()
      // Mark as selecting when using keyboard shortcut
      setIsSelecting(true)
    }
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

  const parts = value.split('=');
  const input = parts[0];
  const result = parts[1]?.trim();

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

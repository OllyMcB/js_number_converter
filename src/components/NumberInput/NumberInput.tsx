import React, { useRef } from 'react'
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

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => 
  {
    if (!onMouseMove) return

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
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
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

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (inputRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const charWidth = 8.4; // Approximate width of a character in the monospace font
      const clickedPosition = Math.floor((x - 20) / charWidth); // 20px for padding
      
      inputRef.current.focus();
      inputRef.current.setSelectionRange(
        Math.max(0, Math.min(clickedPosition, input.length)),
        Math.max(0, Math.min(clickedPosition, input.length))
      );
    }
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
            className={styles.hiddenInput}
            placeholder={placeholder}
            style={{ caretColor: 'var(--text-primary)' }}
          />
          <div 
            className={styles.characters} 
            onClick={handleClick}
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
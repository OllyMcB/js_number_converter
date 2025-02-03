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
  type,
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

    const text = parent.textContent || ''
    const position = Array.from(parent.children).indexOf(target)
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
          />
          <div className={styles.characters}>
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
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

  const renderCharacters = () => 
  {
    if (!value) 
    {
      return <span className={styles.placeholder}>{placeholder}</span>
    }

    // Split into input and result parts if there's a calculation
    const parts = value.split('=')
    const input = parts[0].trim()
    const result = parts[1]?.trim()

    return (
      <>
        {input.split('').map((char, i) => 
        {
          const highlight = highlights.find(h => i >= h.start && i < h.end)
          const style = highlight ? { backgroundColor: highlight.color } : undefined

          return (
            <span
              key={i}
              className={styles.character}
              style={style}
              onMouseMove={handleMouseMove}
              onMouseLeave={onMouseLeave}
            >
              {char}
            </span>
          )
        })}
        {result && (
          <span className={styles.result}>
            = {result}
          </span>
        )}
      </>
    )
  }

  return (
    <div className={styles.container}>
      <label className={styles.label}>{label}</label>
      <div className={styles.inputContainer}>
        <div className={styles.displayContainer}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={styles.hiddenInput}
            placeholder={placeholder}
          />
          <div className={styles.characters}>{renderCharacters()}</div>
        </div>
      </div>
    </div>
  )
} 
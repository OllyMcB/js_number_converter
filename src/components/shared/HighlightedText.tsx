import React, { useCallback } from 'react'
import { CharacterSpan } from './CharacterSpan'

export interface HighlightRange {
  start: number
  end: number
  color?: string
}

interface HighlightedTextProps {
  text: string
  highlights?: HighlightRange[]
  onMouseMove?: (position: number) => void
  onMouseLeave?: () => void
  className?: string
  characterClassName?: string
  placeholder?: string
}

/**
 * @brief Reusable component for rendering text with character-level highlighting
 */
export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  highlights = [],
  onMouseMove,
  onMouseLeave,
  className,
  characterClassName,
  placeholder,
}) => {
  const handleCharacterMouseMove = useCallback(
    (index: number) => (e: React.MouseEvent<HTMLSpanElement>) => {
      if (onMouseMove) {
        onMouseMove(index)
      }
    },
    [onMouseMove]
  )

  if (!text && placeholder) {
    return <span className={className}>{placeholder}</span>
  }

  if (!text) {
    return null
  }

  const chars = text.split('')

  return (
    <span className={className}>
      {chars.map((char, index) => {
        const highlight = highlights.find(
          (h) => index >= h.start && index < h.end
        )
        const highlighted = !!highlight

        return (
          <CharacterSpan
            key={index}
            char={char}
            highlighted={highlighted}
            highlightColor={highlight?.color}
            onMouseMove={handleCharacterMouseMove(index)}
            onMouseLeave={onMouseLeave}
            className={characterClassName}
          />
        )
      })}
    </span>
  )
}


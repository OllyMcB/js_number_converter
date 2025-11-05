import React from 'react'

interface CharacterSpanProps {
  char: string
  highlighted: boolean
  highlightColor?: string
  onMouseMove?: (e: React.MouseEvent<HTMLSpanElement>) => void
  onMouseLeave?: (e: React.MouseEvent<HTMLSpanElement>) => void
  className?: string
}

/**
 * @brief Individual character span component with highlight support
 */
export const CharacterSpan: React.FC<CharacterSpanProps> = ({
  char,
  highlighted,
  highlightColor = '#ff3399',
  onMouseMove,
  onMouseLeave,
  className,
}) => {
  const style = highlighted ? { color: highlightColor } : undefined

  return (
    <span
      className={className}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {char}
    </span>
  )
}


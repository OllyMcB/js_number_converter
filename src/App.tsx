import { useState } from 'react'
import { Container, Paper, IconButton, Typography, Box } from '@mui/material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import SettingsIcon from '@mui/icons-material/Settings'
import { NumberInput } from './components/NumberInput/NumberInput'
import './App.scss'

interface NumberValues {
  decimal: string
  hex: string
  binary: string
  ascii: string
}

function App() {
  const [values, setValues] = useState<NumberValues>({
    decimal: '',
    hex: '',
    binary: '',
    ascii: ''
  })

  const convertNumber = (num: number): NumberValues => ({
    decimal: num.toString(),
    hex: '0x' + num.toString(16).toUpperCase(),
    binary: num.toString(2).padStart(8, '0'),
    ascii: String.fromCharCode(num)
  })

  const handleDecimalChange = (value: string) => {
    setValues({ ...values, decimal: value })

    if (value.trim() === '') {
      setValues({ decimal: value, hex: '', binary: '', ascii: '' })
      return
    }

    const numbers = value.split(' ').filter(n => n.trim().length > 0)
    if (numbers.length > 0) {
      const conversions = numbers.map(n => {
        const num = parseInt(n)
        return !isNaN(num) ? convertNumber(num) : null
      }).filter(n => n !== null)

      if (conversions.length > 0) {
        setValues({
          decimal: value,
          hex: conversions.map(n => n?.hex).join(' '),
          binary: conversions.map(n => n?.binary).join(' '),
          ascii: conversions.map(n => n?.ascii).join('')
        })
      }
    }
  }

  const handleHexChange = (value: string) => {
    setValues({ ...values, hex: value })

    if (value.trim() === '') {
      setValues({ decimal: '', hex: value, binary: '', ascii: '' })
      return
    }

    const numbers = value.split(' ').filter(n => n.trim().length > 0)
    if (numbers.length > 0) {
      const conversions = numbers.map(n => {
        // Handle hex numbers with or without 0x prefix
        const cleanHex = n.toLowerCase().replace(/^0x/, '')
        const num = parseInt(cleanHex, 16)
        return !isNaN(num) ? convertNumber(num) : null
      }).filter(n => n !== null)

      if (conversions.length > 0) {
        setValues({
          decimal: conversions.map(n => n?.decimal).join(' '),
          hex: value,
          binary: conversions.map(n => n?.binary).join(' '),
          ascii: conversions.map(n => n?.ascii).join('')
        })
      }
    }
  }

  const handleBinaryChange = (value: string) => {
    setValues({ ...values, binary: value })

    if (value.trim() === '') {
      setValues({ decimal: '', hex: '', binary: value, ascii: '' })
      return
    }

    const numbers = value.split(' ').filter(n => n.trim().length > 0)
    if (numbers.length > 0) {
      const conversions = numbers.map(n => {
        const num = parseInt(n, 2)
        return !isNaN(num) ? convertNumber(num) : null
      }).filter(n => n !== null)

      if (conversions.length > 0) {
        setValues({
          decimal: conversions.map(n => n?.decimal).join(' '),
          hex: conversions.map(n => n?.hex).join(' '),
          binary: value,
          ascii: conversions.map(n => n?.ascii).join('')
        })
      }
    }
  }

  const handleAsciiChange = (value: string) => {
    if (value === '') {
      setValues({ decimal: '', hex: '', binary: '', ascii: '' })
      return
    }

    const chars = value.split('')
    const conversions = chars.map(char => {
      const charCode = char.charCodeAt(0)
      return convertNumber(charCode)
    })

    setValues({
      decimal: conversions.map(n => n.decimal).join(' '),
      hex: conversions.map(n => n.hex).join(' '),
      binary: conversions.map(n => n.binary).join(' '),
      ascii: value
    })
  }

  return (
    <Container maxWidth="md" className="app">
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Number Converter
      </Typography>
      <Paper elevation={3} className="converter">
        <NumberInput
          label="Decimal"
          value={values.decimal}
          placeholder="Enter decimal number(s)"
          onChange={handleDecimalChange}
          type="decimal"
        />
        <NumberInput
          label="Hex"
          value={values.hex}
          placeholder="Enter hex number(s)"
          onChange={handleHexChange}
          type="hex"
        />
        <NumberInput
          label="Binary"
          value={values.binary}
          placeholder="Enter binary number(s)"
          onChange={handleBinaryChange}
          type="binary"
        />
        <NumberInput
          label="ASCII"
          value={values.ascii}
          placeholder="Enter ASCII character(s)"
          onChange={handleAsciiChange}
          type="ascii"
        />
        <Box className="controls">
          <IconButton className="help" size="large">
            <HelpOutlineIcon />
          </IconButton>
          <IconButton size="large">
            <SettingsIcon />
          </IconButton>
        </Box>
      </Paper>
    </Container>
  )
}

export default App

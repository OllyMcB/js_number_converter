import { createTheme } from '@mui/material';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#ffffff',
      paper: 'rgba(255, 255, 255, 0.8)'
    },
    primary: {
      main: '#2196f3',
    },
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.05)',
          backgroundImage: 'none'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          margin: '8px 0',
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.7)'
          }
        }
      }
    }
  }
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: 'rgba(30, 30, 30, 0.8)'
    },
    primary: {
      main: '#90caf9',
    },
  },
  shape: {
    borderRadius: 12
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 20px rgba(0, 0, 0, 0.2)',
          backgroundImage: 'none'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          margin: '8px 0',
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.2)'
          }
        }
      }
    }
  }
}); 
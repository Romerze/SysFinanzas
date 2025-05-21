import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Los estilos de MUI pueden prevalecer, pero lo mantenemos por si acaso.

// Importaciones de MUI
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Crear un tema básico de MUI (puedes personalizarlo más adelante)
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Un azul estándar
        },
        secondary: {
            main: '#dc004e', // Un rosa estándar
        },
    },
});

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Normaliza estilos y aplica el fondo del tema, etc. */}
            <App />
        </ThemeProvider>
    </StrictMode>
);

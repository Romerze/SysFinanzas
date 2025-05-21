import React, { useState, useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegistrationPage from './pages/RegistrationPage'; 

// Importar Box de MUI
import Box from '@mui/material/Box';

// import './App.css'; // Lo mantendremos comentado

function App() {
    // Estado para manejar la autenticación y forzar re-renderizado
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(!!localStorage.getItem('accessToken'));

    // Función para actualizar el estado de autenticación
    const handleAuthChange = () => {
        setIsUserAuthenticated(!!localStorage.getItem('accessToken'));
    };

    return (
        <Router>
            {/* Usar Box de MUI para un mejor control del layout y centrado */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column', // Apila las páginas verticalmente (aunque solo una se muestra)
                    alignItems: 'center',    // Esto centrará el componente de la ruta activa (ej. el Container de LoginPage)
                    minHeight: '100vh',      // Asegura que el Box ocupe al menos toda la altura de la vista
                    // pt: 4,                // Opcional: Padding superior global si es necesario
                    // justifyContent: 'center' // Opcional: para centrar verticalmente también, LoginPage ya tiene su propio margen superior.
                }}
            >
                <Routes>
                    <Route 
                        path="/login" 
                        element={
                            isUserAuthenticated ? (
                                <Navigate to="/dashboard" replace />
                            ) : (
                                <LoginPage onLoginSuccess={handleAuthChange} />
                            )
                        }
                    />
                    <Route 
                        path="/register" 
                        element={<RegistrationPage />} 
                    />
                    <Route 
                        path="/dashboard" 
                        element={isUserAuthenticated ? <DashboardPage onLogout={handleAuthChange} /> : <Navigate to="/login" replace />} 
                    />
                    <Route 
                        path="*" 
                        element={isUserAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
                    />
                </Routes>
            </Box>
        </Router>
    );
}

export default App;

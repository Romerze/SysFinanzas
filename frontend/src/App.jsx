import React, { useState } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegistrationPage from './pages/RegistrationPage'; 
import CategoryManagementPage from './pages/CategoryManagementPage'; 
import IncomesPage from './pages/IncomesPage'; 
import ExpensesPage from './pages/ExpensesPage'; // Importar ExpensesPage
import ProfilePage from './pages/ProfilePage'; // Añadido para HU011
import MainLayout from './components/MainLayout'; // Importar MainLayout

// Importar Box de MUI
// import Box from '@mui/material/Box'; // Ya no es necesario aquí

// import './App.css'; // Lo mantendremos comentado

function App() {
    // Estado para manejar la autenticación y forzar re-renderizado
    const [isUserAuthenticated, setIsUserAuthenticated] = useState(!!localStorage.getItem('accessToken'));

    // Función para actualizar el estado de autenticación
    const handleAuthChange = () => {
        setIsUserAuthenticated(!!localStorage.getItem('accessToken'));
    };

    // Componente para rutas protegidas que usan MainLayout
    const ProtectedRoutesLayout = () => {
        if (!isUserAuthenticated) {
            return <Navigate to="/login" replace />;
        }
        // Pasamos onLogout (que es handleAuthChange) a MainLayout
        return <MainLayout onLogout={handleAuthChange} />; 
        // MainLayout internamente usará <Outlet /> para renderizar las rutas hijas
    };

    return (
        <Router>
            {/* El Box global se elimina, MainLayout se encargará de su propia estructura */}
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
                
                {/* Rutas protegidas que usarán MainLayout */}
                <Route element={<ProtectedRoutesLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/incomes" element={<IncomesPage />} />
                    <Route path="/categories" element={<CategoryManagementPage />} /> {/* Ruta actualizada */}
                    <Route path="/expenses" element={<ExpensesPage />} /> {/* Nueva ruta para Gastos */}
                    <Route path="/profile" element={<ProfilePage />} /> {/* Añadido para HU011 */}
                    {/* Aquí puedes añadir más rutas que usen MainLayout en el futuro */}
                </Route>

                {/* Redirección por defecto */}
                <Route 
                    path="*" 
                    element={isUserAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
                />
            </Routes>
        </Router>
    );
}

export default App;

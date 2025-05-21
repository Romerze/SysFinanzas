import React from 'react';
import { logoutUser } from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Button, 
    Container, 
    Box, 
    CssBaseline 
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout'; // Icono para el botón de logout

function DashboardPage({ onLogout }) { 
    const navigate = useNavigate();

    const handleLogout = () => {
        logoutUser();
        if (onLogout) {
            onLogout(); 
        }
        navigate('/login'); 
    };

    return (
        // Nuevo Box raíz para controlar el layout interno de DashboardPage
        <Box 
            sx={{ 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center' // Esto centrará el Container del contenido
            }}
        >
            {/* CssBaseline normaliza los estilos y es bueno tenerlo por página si no se usa globalmente de otra forma específica */}
            {/* Aunque ya lo tenemos en main.jsx, ponerlo aquí no hace daño y asegura consistencia si esta página se usara aislada */}
            <CssBaseline /> 
            {/* Wrapper para el AppBar, asegurando que ocupe todo el ancho */}
            <Box sx={{ width: '100%' }}> 
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Dashboard Financiero
                        </Typography>
                        <Button 
                            color="inherit" 
                            onClick={handleLogout}
                            startIcon={<LogoutIcon />}
                        >
                            Cerrar Sesión
                        </Button>
                    </Toolbar>
                </AppBar>
            </Box>

            {/* Container para el contenido principal, será centrado por el Box raíz */}
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}> 
                <Box sx={{ my: 4 }}> 
                    <Typography variant="h4" component="h1" gutterBottom>
                        ¡Bienvenido a tu panel de control!
                    </Typography>
                    <Typography variant="body1">
                        Aquí podrás visualizar y gestionar tus ingresos, gastos, presupuestos y mucho más.
                    </Typography>
                    {/* Aquí irán los componentes del dashboard: gráficos, tablas, etc. */}
                </Box>
            </Container>
        </Box>
    );
}

export default DashboardPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/apiService';

// Importaciones de MUI
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline'; // Ya está en main.jsx, pero puede ser útil aquí para el contexto
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link'; // Para futuros enlaces como "¿Olvidaste tu contraseña?"
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress'; // Para el indicador de carga
import Alert from '@mui/material/Alert'; // Para mostrar errores

function LoginPage({ onLoginSuccess }) { // Recibir prop
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Aunque no lo usemos directamente para redirigir al dashboard aquí, puede ser útil para otras navegaciones futuras.

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userData = await loginUser({ email: email, password: password });
            console.log('Login exitoso:', userData);
            if (onLoginSuccess) {
                onLoginSuccess(); // Notificar a App.jsx para que actualice su estado
            }
            // Ya NO navegamos desde aquí. App.jsx se encargará de la redirección
            // navigate('/dashboard'); 
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.username?.[0] || err.response?.data?.password?.[0] || 'Error al iniciar sesión. Verifica tus credenciales.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            {/* CssBaseline ya está global, pero no daña tenerlo */}
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Iniciar Sesión
                </Typography>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Correo Electrónico"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!error && (error.includes('email') || error.includes('usuario'))} // Heurística para marcar error
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Contraseña"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!error && error.includes('contraseña')} // Heurística
                    />
                    {/* Podríamos añadir un Checkbox para "Recordarme" aquí */}
                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                            {error}
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Ingresar'}
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid item xs>
                            {/* <Link href="#" variant="body2">
                                ¿Olvidaste tu contraseña?
                            </Link> */}
                        </Grid>
                        <Grid item>
                            <Link href="/register" variant="body2">
                                ¿No tienes una cuenta? Regístrate
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 8, mb: 4 }}>
                {'Copyright '}
                <Link color="inherit" href="https://tuempresa.com/">
                    Tu Empresa Financiera
                </Link>{' '}
                {new Date().getFullYear()}
                {'.'}
            </Typography>
        </Container>
    );
}

export default LoginPage;

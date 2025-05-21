import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/apiService';

// Importaciones de MUI
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // O quizás otro icono como AppRegistrationIcon
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

function RegistrationPage() {
    const [formData, setFormData] = useState({
        username: '',
        firstName: '', // Django espera 'first_name', pero el serializer podría manejarlo
        email: '',
        password: '',
        password2: '', // Para la confirmación de contraseña
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (formData.password !== formData.password2) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        // El backend espera: username, email, password, first_name
        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            first_name: formData.firstName, // Asegurar que el nombre del campo coincida con el serializer
        };

        try {
            const response = await registerUser(payload);
            console.log('Registro exitoso:', response);
            setSuccess('¡Registro exitoso! Ahora puedes iniciar sesión.');
            // Opcional: Redirigir a login después de unos segundos o al hacer clic en un botón
            setTimeout(() => {
                navigate('/login');
            }, 3000); // Redirige a login después de 3 segundos
        } catch (err) {
            let errorMessage = 'Error al registrar. Intenta de nuevo.';
            if (err.response && err.response.data) {
                // Intentar obtener mensajes de error específicos del backend
                const errors = err.response.data;
                if (errors.username) errorMessage = `Usuario: ${errors.username[0]}`;
                else if (errors.email) errorMessage = `Email: ${errors.email[0]}`;
                else if (errors.password) errorMessage = `Contraseña: ${errors.password[0]}`;
                else if (errors.detail) errorMessage = errors.detail;
                else {
                    // Fallback para errores no estructurados
                    const errorValues = Object.values(errors);
                    if (errorValues.length > 0 && Array.isArray(errorValues[0]) && errorValues[0].length > 0) {
                        errorMessage = errorValues[0][0];
                    }
                }
            }
            setError(errorMessage);
            console.error("Error en el registro:", err.response || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon /> {/* Considerar AppRegistrationIcon de @mui/icons-material */}
                </Avatar>
                <Typography component="h1" variant="h5">
                    Crear Cuenta
                </Typography>
                {success && (
                    <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
                        {success}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ width: '100%', mt: 2, mb: success ? 0 : 2 }}>
                        {error}
                    </Alert>
                )}
                {!success && ( // Solo mostrar formulario si no hay mensaje de éxito
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Nombre de Usuario"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={formData.username}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="firstName"
                            label="Nombre"
                            name="firstName"
                            autoComplete="given-name"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Correo Electrónico"
                            name="email"
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Contraseña"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password2"
                            label="Confirmar Contraseña"
                            type="password"
                            id="password2"
                            autoComplete="new-password"
                            value={formData.password2}
                            onChange={handleChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
                        </Button>
                        <Grid container justifyContent="flex-end">
                            <Grid item>
                                <Link href="/login" variant="body2">
                                    ¿Ya tienes una cuenta? Inicia sesión
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Box>
        </Container>
    );
}

export default RegistrationPage;

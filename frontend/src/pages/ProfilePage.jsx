import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Typography, Container, Paper, Grid, Alert } from '@mui/material';
import { getUserProfile, updateUserProfile, changePassword } from '../services/apiService';

const ProfilePage = () => {
    const [userData, setUserData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        username: '', // El username es de solo lectura
    });
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password1: '',
        new_password2: '',
    });
    const [alertMessage, setAlertMessage] = useState({ type: '', message: '' });
    const [profileErrors, setProfileErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const data = await getUserProfile();
                setUserData({
                    first_name: data.first_name || '',
                    last_name: data.last_name || '',
                    email: data.email || '',
                    username: data.username || '',
                });
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setAlertMessage({ type: 'error', message: 'Error al cargar el perfil del usuario.' });
            }
        };
        fetchUserProfile();
    }, []);

    const handleProfileChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setAlertMessage({ type: '', message: '' });
        setProfileErrors({});
        try {
            // Solo enviar los campos que pueden ser modificados
            const { first_name, last_name, email } = userData;
            await updateUserProfile({ first_name, last_name, email });
            setAlertMessage({ type: 'success', message: 'Perfil actualizado exitosamente.' });
        } catch (error) {
            console.error('Error updating profile:', error.response?.data);
            setAlertMessage({ type: 'error', message: 'Error al actualizar el perfil.' });
            if (error.response && error.response.data) {
                setProfileErrors(error.response.data);
            }
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setAlertMessage({ type: '', message: '' });
        setPasswordErrors({});
        if (passwordData.new_password1 !== passwordData.new_password2) {
            setPasswordErrors({ new_password2: ['Las nuevas contraseñas no coinciden.'] });
            return;
        }
        try {
            await changePassword(passwordData);
            setAlertMessage({ type: 'success', message: 'Contraseña actualizada exitosamente.' });
            setPasswordData({ old_password: '', new_password1: '', new_password2: '' }); // Limpiar campos
        } catch (error) {
            console.error('Error changing password:', error.response?.data);
            setAlertMessage({ type: 'error', message: 'Error al cambiar la contraseña.' });
            if (error.response && error.response.data) {
                setPasswordErrors(error.response.data);
            }
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 4 }}>
                Editar Perfil
            </Typography>

            {alertMessage.message && (
                <Alert severity={alertMessage.type} sx={{ mb: 2 }}>
                    {alertMessage.message}
                </Alert>
            )}

            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Información del Perfil
                </Typography>
                <Box component="form" onSubmit={handleProfileSubmit} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nombre de Usuario (no editable)"
                                name="username"
                                value={userData.username}
                                InputProps={{
                                    readOnly: true,
                                }}
                                variant="filled"
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Nombre"
                                name="first_name"
                                value={userData.first_name}
                                onChange={handleProfileChange}
                                error={!!profileErrors.first_name}
                                helperText={profileErrors.first_name?.[0]}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Apellido"
                                name="last_name"
                                value={userData.last_name}
                                onChange={handleProfileChange}
                                error={!!profileErrors.last_name}
                                helperText={profileErrors.last_name?.[0]}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Correo Electrónico"
                                name="email"
                                type="email"
                                value={userData.email}
                                onChange={handleProfileChange}
                                error={!!profileErrors.email}
                                helperText={profileErrors.email?.[0]}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 2, textAlign: 'right' }}>
                            <Button type="submit" variant="contained" color="primary">
                                Guardar Cambios de Perfil
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h6" gutterBottom>
                    Cambiar Contraseña
                </Typography>
                <Box component="form" onSubmit={handlePasswordSubmit} noValidate>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Contraseña Actual"
                                name="old_password"
                                type="password"
                                value={passwordData.old_password}
                                onChange={handlePasswordChange}
                                error={!!passwordErrors.old_password}
                                helperText={passwordErrors.old_password?.[0]}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Nueva Contraseña"
                                name="new_password1"
                                type="password"
                                value={passwordData.new_password1}
                                onChange={handlePasswordChange}
                                error={!!passwordErrors.new_password1}
                                helperText={passwordErrors.new_password1?.[0]}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Confirmar Nueva Contraseña"
                                name="new_password2"
                                type="password"
                                value={passwordData.new_password2}
                                onChange={handlePasswordChange}
                                error={!!passwordErrors.new_password2}
                                helperText={passwordErrors.new_password2?.[0]}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ mt: 2, textAlign: 'right' }}>
                            <Button type="submit" variant="contained" color="secondary">
                                Cambiar Contraseña
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>
        </Container>
    );
};

export default ProfilePage;

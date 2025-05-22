// frontend/src/pages/CategoriesPage.jsx
import React, { useState, useEffect } from 'react';
import {
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Box,
    CircularProgress,
    Paper
} from '@mui/material';
import AddCategoryModal from '../components/AddCategoryModal'; // Importar el modal
import { getCategories } from '../services/apiService';
import AddIcon from '@mui/icons-material/Add';

function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal

    const fetchCategories = () => { // Función para encapsular la carga
        setLoading(true);
        getCategories()
            .then(data => {
                setCategories(data || []);
                setError(null);
            })
            .catch(err => {
                console.error("Error al obtener categorías:", err);
                setError("No se pudieron cargar las categorías. Inténtalo de nuevo más tarde.");
                setCategories([]);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchCategories(); // Cargar al montar
    }, []);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleCategoryAdded = (newCategory) => {
        fetchCategories(); 
        handleCloseModal();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px - 48px)' }}> 
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box> 
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestión de Categorías
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenModal} 
                >
                    Nueva Categoría
                </Button>
            </Box>

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            {categories.length === 0 && !error && (
                <Typography sx={{ mt: 2 }}>
                    No tienes categorías creadas. ¡Añade una!
                </Typography>
            )}

            {categories.length > 0 && (
                 <Paper elevation={2}>
                    <List>
                        {categories.map(category => (
                            <ListItem key={category.id} divider>
                                <ListItemText
                                    primary={category.name}
                                    secondary={category.user ? 'Personalizada' : 'Global'}
                                />
                                {/* Aquí podríamos añadir botones de Editar/Eliminar en el futuro */}
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}
            <AddCategoryModal
                open={isModalOpen}
                onClose={handleCloseModal}
                onCategoryAdded={handleCategoryAdded}
            />
        </Box>
    );
}

export default CategoriesPage;

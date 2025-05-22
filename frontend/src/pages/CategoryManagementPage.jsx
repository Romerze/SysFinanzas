import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    CircularProgress,
    Alert,
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/apiService';

// Modal para crear/editar categoría (simplificado por ahora)
const CategoryModal = ({ open, onClose, onSave, category, isEditMode }) => {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode && category) {
            setName(category.name);
        } else {
            setName('');
        }
        setError('');
    }, [open, category, isEditMode]);

    const handleSave = async () => {
        if (!name.trim()) {
            setError('El nombre de la categoría es obligatorio.');
            return;
        }
        try {
            await onSave(name);
            onClose();
        } catch (apiError) {
            setError(apiError.message || 'Error al guardar la categoría.');
            console.error("Error saving category:", apiError);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isEditMode ? 'Editar Categoría' : 'Crear Nueva Categoría'}</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Nombre de la Categoría"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={Boolean(error)}
                />
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px' }}>
                <Button onClick={onClose} variant="outlined">Cancelar</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    {isEditMode ? 'Guardar Cambios' : 'Crear Categoría'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Diálogo de confirmación para eliminar
const ConfirmationDialog = ({ open, onClose, onConfirm, title, message }) => (
    <Dialog open={open} onClose={onClose}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
            <DialogContentText>{message}</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px' }}>
            <Button onClick={onClose} variant="outlined">Cancelar</Button>
            <Button onClick={onConfirm} color="error" variant="contained">Confirmar</Button>
        </DialogActions>
    </Dialog>
);

function CategoryManagementPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [modalOpen, setModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);

    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data.filter(cat => cat.user !== null)); // Mostrar solo categorías del usuario
            setError('');
        } catch (err) {
            setError('Error al cargar las categorías. ' + (err.message || ''));
            console.error(err);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenCreateModal = () => {
        setIsEditMode(false);
        setCurrentCategory(null);
        setModalOpen(true);
    };

    const handleOpenEditModal = (category) => {
        setIsEditMode(true);
        setCurrentCategory(category);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setCurrentCategory(null);
    };

    const handleSaveCategory = async (name) => {
        try {
            if (isEditMode && currentCategory) {
                await updateCategory(currentCategory.id, { name });
            } else {
                await createCategory({ name }); // Asume que el backend asigna el usuario
            }
            fetchCategories(); // Recargar categorías
            // Considerar mostrar un snackbar de éxito
        } catch (saveError) {
            console.error("Error saving category from page:", saveError);
            // El modal ya maneja su propio error, pero podrías querer mostrar uno general aquí también.
            throw saveError; // Re-throw para que el modal lo maneje
        }
    };

    const handleOpenConfirmDelete = (category) => {
        setCategoryToDelete(category);
        setConfirmDialogOpen(true);
    };

    const handleCloseConfirmDelete = () => {
        setCategoryToDelete(null);
        setConfirmDialogOpen(false);
    };

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;
        try {
            await deleteCategory(categoryToDelete.id);
            fetchCategories(); // Recargar categorías
            handleCloseConfirmDelete();
            // Considerar mostrar un snackbar de éxito
        } catch (deleteError) {
            setError('Error al eliminar la categoría. ' + (deleteError.message || ''));
            console.error(deleteError);
            handleCloseConfirmDelete();
        }
    };

    if (loading) {
        return <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Container>;
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Administrar Categorías
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateModal}
                >
                    Nueva Categoría
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {categories.length === 0 && !error && (
                <Typography sx={{ textAlign: 'center', mt: 3 }}>
                    No has creado ninguna categoría personalizada todavía.
                </Typography>
            )}

            <List>
                {categories.map((category) => (
                    <ListItem key={category.id} divider>
                        <ListItemText primary={category.name} />
                        <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditModal(category)} sx={{ mr: 1 }}>
                                <EditIcon />
                            </IconButton>
                            <IconButton edge="end" aria-label="delete" onClick={() => handleOpenConfirmDelete(category)}>
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            <CategoryModal 
                open={modalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveCategory} 
                category={currentCategory}
                isEditMode={isEditMode}
            />

            <ConfirmationDialog 
                open={confirmDialogOpen}
                onClose={handleCloseConfirmDelete}
                onConfirm={handleDeleteCategory}
                title="Confirmar Eliminación"
                message={`¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete?.name}"? Esta acción no se puede deshacer.`}
            />

        </Container>
    );
}

export default CategoryManagementPage;

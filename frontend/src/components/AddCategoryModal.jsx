// frontend/src/components/AddCategoryModal.jsx
import React, { useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { createCategory } from '../services/apiService'; 

function AddCategoryModal({ open, onClose, onCategoryAdded }) {
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');

    const handleNameChange = (e) => {
        setCategoryName(e.target.value);
        if (e.target.value.trim()) {
            setError('');
        }
    };

    const handleSubmit = async () => {
        if (!categoryName.trim()) {
            setError('El nombre de la categoría es requerido.');
            return;
        }
        try {
            const newCategory = await createCategory({ name: categoryName }); 
            onCategoryAdded(newCategory); 
            handleClose();
        } catch (err) {
            console.error("Error al crear categoría:", err);
            const backendError = err.response?.data?.name?.[0] || err.response?.data?.detail || 'Error al crear la categoría. Puede que ya exista o sea inválida.';
            setError(backendError);
        }
    };

    const handleClose = () => {
        setCategoryName('');
        setError('');
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
            <DialogTitle>
                Nueva Categoría
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Nombre de la Categoría"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={categoryName}
                    onChange={handleNameChange}
                    error={!!error}
                    helperText={error}
                    sx={{ mt: 1 }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained">Guardar</Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddCategoryModal;

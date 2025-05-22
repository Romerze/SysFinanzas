import React, { useState, useEffect } from 'react';
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    CircularProgress,
    Alert,
    Box,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'; 
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { es } from 'date-fns/locale'; 
import { getCategories } from '../services/apiService'; // Reutilizamos getCategories

function AddExpenseModal({ open, onClose, onExpenseAdded, onExpenseUpdated, expenseToEdit }) {
    const initialFormData = {
        description: '',
        amount: '',
        date: new Date(),
        category_id: null, // Almacenará el ID de la categoría seleccionada
        source: '', // Podría ser método de pago, etc. Por ahora opcional o fijo
        recurrence: 'none',
    };
    const [formData, setFormData] = useState(initialFormData);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [categoryError, setCategoryError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const isEditMode = Boolean(expenseToEdit);

    useEffect(() => {
        const fetchUserCategories = async () => {
            setLoadingCategories(true);
            try {
                const userCategories = await getCategories();
                setCategories(userCategories || []);
                setCategoryError('');
            } catch (error) {
                console.error("Error fetching categories:", error);
                setCategoryError('No se pudieron cargar las categorías.');
                setCategories([]);
            }
            setLoadingCategories(false);
        };

        if (open) {
            fetchUserCategories();
            if (isEditMode && expenseToEdit) {
                // Formatear la fecha si viene como string desde el backend
                let dateToSet = expenseToEdit.date;
                if (typeof dateToSet === 'string') {
                    dateToSet = new Date(dateToSet.split('T')[0] + 'T12:00:00'); // Asegurar que se interprete como fecha local
                }
                setFormData({
                    description: expenseToEdit.description || '',
                    amount: expenseToEdit.amount ? expenseToEdit.amount.toString() : '',
                    date: dateToSet || new Date(),
                    category_id: expenseToEdit.category, // Asume que expenseToEdit.category es el ID
                    source: expenseToEdit.source || 'No especificada', // Valor por defecto si es opcional
                    recurrence: expenseToEdit.recurrence || 'none',
                });
            } else {
                setFormData(initialFormData);
            }
            setFormErrors({}); // Limpiar errores al abrir
        }
    }, [open, isEditMode, expenseToEdit]); // No incluir initialFormData aquí para evitar reseteos innecesarios

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleDateChange = (newDate) => {
        setFormData(prev => ({ ...prev, date: newDate }));
        if (formErrors.date) {
            setFormErrors(prev => ({ ...prev, date: null }));
        }
    };

    const handleCategoryChange = (event, newValue) => {
        setFormData(prev => ({ ...prev, category_id: newValue ? newValue.id : null }));
        if (formErrors.category_id) {
            setFormErrors(prev => ({ ...prev, category_id: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.description.trim()) errors.description = 'La descripción es obligatoria.';
        if (!formData.amount.trim()) {
            errors.amount = 'El monto es obligatorio.';
        } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
            errors.amount = 'El monto debe ser un número positivo.';
        }
        if (!formData.category_id) errors.category_id = 'La categoría es obligatoria.';
        if (!formData.date) errors.date = 'La fecha es obligatoria.';
        // source y recurrence tienen valores por defecto, así que usualmente no necesitan validación de "obligatorio"
        // a menos que quieras asegurar que no se hayan borrado por alguna razón.

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        // Formatear la fecha a YYYY-MM-DD para el backend
        const submissionData = {
            ...formData,
            date: formData.date.toISOString().split('T')[0],
            amount: parseFloat(formData.amount) // Asegurar que el monto sea un número
        };

        try {
            if (isEditMode) {
                await onExpenseUpdated(expenseToEdit.id, submissionData);
            } else {
                await onExpenseAdded(submissionData);
            }
            // onClose(); // El cierre y el snackbar se manejan en ExpensesPage
        } catch (error) {
            // El manejo de errores (snackbar) se hace en ExpensesPage
            // Aquí podríamos establecer errores específicos del formulario si el backend los devuelve de esa forma
            console.error("Error en el submit del modal:", error);
        }
    };

    const selectedCategoryObject = categories.find(cat => cat.id === formData.category_id) || null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ m: 0, p: 2 }}>
                {isEditMode ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Box component="form" id="add-expense-form" onSubmit={handleSubmit} sx={{ mt: 0 }}>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="description"
                            label="Descripción"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            error={Boolean(formErrors.description)}
                            helperText={formErrors.description}
                            autoFocus
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="amount"
                            label="Monto"
                            type="number"
                            id="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            error={Boolean(formErrors.amount)}
                            helperText={formErrors.amount}
                            InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                        />
                        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                            <DatePicker
                                label="Fecha"
                                value={formData.date}
                                onChange={handleDateChange}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        margin="normal"
                                        fullWidth
                                        required
                                        error={Boolean(formErrors.date)}
                                        helperText={formErrors.date}
                                    />
                                )}
                            />
                        </LocalizationProvider>
                        <Autocomplete
                            options={categories}
                            getOptionLabel={(option) => option.name || ''}
                            value={selectedCategoryObject} 
                            onChange={handleCategoryChange}
                            loading={loadingCategories}
                            loadingText="Cargando categorías..."
                            noOptionsText={categoryError || "No hay categorías disponibles"}
                            fullWidth
                            sx={{ mt: 2, mb: 1 }} 
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    label="Categoría"
                                    required
                                    fullWidth
                                    error={Boolean(formErrors.category_id) || Boolean(categoryError)}
                                    helperText={formErrors.category_id || categoryError}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingCategories ? <CircularProgress color="inherit" size={20} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            label="Fuente/Método de Pago (Opcional)"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                        />
                        <FormControl fullWidth margin="normal" variant="outlined">
                            <InputLabel id="recurrence-label">Recurrencia</InputLabel>
                            <Select
                                labelId="recurrence-label"
                                name="recurrence"
                                value={formData.recurrence}
                                onChange={handleChange}
                                label="Recurrencia" 
                            >
                                <MenuItem value="none">Ninguna</MenuItem>
                                <MenuItem value="daily">Diaria</MenuItem>
                                <MenuItem value="weekly">Semanal</MenuItem>
                                <MenuItem value="monthly">Mensual</MenuItem>
                                <MenuItem value="yearly">Anual</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={onClose} variant="outlined" color="secondary">
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                        {isEditMode ? 'Guardar Cambios' : 'Registrar Gasto'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default AddExpenseModal;

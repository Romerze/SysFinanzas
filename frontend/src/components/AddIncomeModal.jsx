import React, { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    FormControlLabel,
    Checkbox,
    Box,
    IconButton,
    Autocomplete,
    CircularProgress
} from '@mui/material';
import {
    LocalizationProvider
} from '@mui/x-date-pickers/LocalizationProvider';
import {
    AdapterDateFns
} from '@mui/x-date-pickers/AdapterDateFns';
import {
    DatePicker
} from '@mui/x-date-pickers/DatePicker';
import CloseIcon from '@mui/icons-material/Close';
import { getCategories } from '../services/apiService';
import { es } from 'date-fns/locale';

function AddIncomeModal({ open, onClose, onIncomeAdded, onIncomeUpdated, incomeToEdit }) {
    const initialFormData = {
        description: '',
        amount: '',
        date: new Date(),
        category_id: null, 
        source: '', 
        recurrente: false,
    };

    const [formData, setFormData] = useState(initialFormData);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [categoryError, setCategoryError] = useState('');
    const [formErrors, setFormErrors] = useState({});

    const isEditMode = Boolean(incomeToEdit);

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
            if (isEditMode && incomeToEdit) {
                console.log('EDIT MODE - incomeToEdit:', JSON.parse(JSON.stringify(incomeToEdit))); // Log del objeto completo
                let dateToSet = incomeToEdit.date;
                if (typeof dateToSet === 'string') {
                    dateToSet = new Date(dateToSet.split('T')[0] + 'T12:00:00');
                }
                setFormData({
                    description: incomeToEdit.description || '',
                    amount: incomeToEdit.amount ? incomeToEdit.amount.toString() : '',
                    date: dateToSet || new Date(),
                    category_id: incomeToEdit.category, // ¿Es este el ID o un objeto?
                    source: incomeToEdit.source || '',
                    recurrente: incomeToEdit.is_recurrent_input,
                });
                console.log('EDIT MODE - formData set with category_id:', incomeToEdit.category);
            } else {
                setFormData(initialFormData);
            }
            setFormErrors({});
        }
    }, [open, isEditMode, incomeToEdit]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
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
        console.log('CATEGORY CHANGE - newValue from Autocomplete:', newValue);
        setFormData(prev => ({ ...prev, category_id: newValue ? newValue.id : null }));
        if (formErrors.category_id) {
            setFormErrors(prev => ({ ...prev, category_id: null }));
        }
        console.log('CATEGORY CHANGE - formData.category_id set to:', newValue ? newValue.id : null);
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
        // source es opcional por ahora

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const submissionData = {
            description: formData.description,
            amount: parseFloat(formData.amount),
            date: formData.date.toISOString().split('T')[0], // Formato YYYY-MM-DD
            category: formData.category_id, // Cambiado de category_id a category
            source: formData.source,
            recurrence: formData.recurrente ? 'monthly' : 'none', // Convertir booleano a string
        };

        console.log('SUBMITTING - submissionData:', submissionData);

        try {
            if (isEditMode) {
                // Asegurarse de que el ID del ingreso a editar se pasa correctamente
                await onIncomeUpdated(incomeToEdit.id, submissionData);
            } else {
                await onIncomeAdded(submissionData);
            }
            onClose(); // Cierra el modal después de agregar/actualizar
        } catch (error) {
            console.error("Error al guardar el ingreso:", error);
            // Aquí podrías manejar errores específicos del backend y mostrarlos en el formulario
            // Por ejemplo, si error es un objeto con detalles de campos:
            if (typeof error === 'object' && error !== null) {
                const backendErrors = {};
                for (const key in error) {
                    if (Object.hasOwnProperty.call(error, key)) {
                        // Ajustar 'category' a 'category_id' si el error del backend se refiere al campo original del formulario
                        const formKey = key === 'category' ? 'category_id' : key;
                        backendErrors[formKey] = Array.isArray(error[key]) ? error[key].join(' ') : error[key];
                    }
                }
                setFormErrors(prev => ({ ...prev, ...backendErrors }));
            }
        }
    };

    const selectedCategoryObject = categories.find(cat => cat.id === formData.category_id) || null;
    if(isEditMode) console.log('EDIT MODE - selectedCategoryObject for Autocomplete:', JSON.parse(JSON.stringify(selectedCategoryObject)));

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {isEditMode ? 'Editar Ingreso' : 'Registrar Nuevo Ingreso'}
                <IconButton aria-label="close" onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <Box component="form" id="add-income-form" onSubmit={handleSubmit} sx={{ mt: 0 }}>
                <DialogContent dividers>
                    {/* Usar Box con flexbox en lugar de Grid para un apilamiento vertical simple */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}> {/* gap: 0 porque margin="normal" ya maneja el espaciado */} 
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
                            sx={{ mt: 2, mb: 1 }} // Equivalente a margin="normal" para Autocomplete
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="outlined"
                                    // margin="normal" // El sx del Autocomplete ya maneja el espaciado vertical
                                    label="Categoría"
                                    required
                                    fullWidth // Asegurar que el TextField interno también sea fullWidth
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
                            label="Fuente (Opcional)"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                        />
                        <FormControlLabel
                            sx={{ mt: 1, mb: 1 }} // Ajustar margen para consistencia
                            control={
                                <Checkbox
                                    checked={formData.recurrente}
                                    onChange={handleChange}
                                    name="recurrente"
                                    color="primary"
                                />
                            }
                            label="Ingreso Recurrente"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: '16px 24px' }}>
                    <Button onClick={onClose} variant="outlined" color="secondary">
                        Cancelar
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                        {isEditMode ? 'Guardar Cambios' : 'Registrar Ingreso'}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
}

export default AddIncomeModal;

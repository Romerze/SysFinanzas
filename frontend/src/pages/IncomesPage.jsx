// frontend/src/pages/IncomesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    List,            // Para la lista
    ListItem,        // Ítem de la lista
    ListItemText,    // Texto del ítem
    CircularProgress,// Indicador de carga
    Paper,           // Para enmarcar la lista
    Divider,         // Divisor entre ítems
    Alert,
    Container,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid, // Para layout de filtros
    FormControl, // Para selects
    InputLabel,  // Para selects
    Select,      // Para selects
    MenuItem,    // Para selects
    Autocomplete, // Para filtro de categoría
    TextField    // Para Autocomplete
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIncomeModal from '../components/AddIncomeModal';
import { getIncomes, addIncome, deleteIncome as apiDeleteIncome, updateIncome as apiUpdateIncome, getCategories } from '../services/apiService';
import { formatCurrency, formatDate } from '../utils/formattingUtils';

function IncomesPage() {
    const [incomes, setIncomes] = useState([]); 
    const [displayedIncomes, setDisplayedIncomes] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);     
    const [isAddIncomeModalOpen, setIsAddIncomeModalOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); 
    const [incomeToDelete, setIncomeToDelete] = useState(null); 
    const [incomeToEdit, setIncomeToEdit] = useState(null); 

    // Estados para filtros y ordenamiento
    const [sortConfig, setSortConfig] = useState({ field: 'date', order: 'desc' });
    const [filterCategory, setFilterCategory] = useState(null); 
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [categoryError, setCategoryError] = useState('');

    const fetchUserCategories = useCallback(async () => {
        setLoadingCategories(true);
        setCategoryError('');
        try {
            const userCategories = await getCategories();
            setCategories(userCategories || []);
        } catch (err) {
            console.error("Error al obtener categorías:", err);
            setCategoryError('No se pudieron cargar las categorías.');
            setCategories([]);
        } finally {
            setLoadingCategories(false);
        }
    }, []);

    useEffect(() => {
        fetchUserCategories();
    }, [fetchUserCategories]);

    const fetchIncomes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getIncomes();
            setIncomes(data || []);
            setError(null);
        } catch (err) {
            console.error("Error al obtener ingresos:", err);
            setError("No se pudieron cargar los ingresos. Inténtalo de nuevo más tarde.");
            setIncomes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIncomes();
    }, [fetchIncomes]);

    // Efecto para actualizar displayedIncomes cuando cambian los ingresos, el orden o el filtro
    useEffect(() => {
        let processedIncomes = [...incomes];

        // Filtrar por categoría
        if (filterCategory) {
            processedIncomes = processedIncomes.filter(income => income.category === filterCategory.id);
        }

        // Ordenar
        if (sortConfig.field) {
            processedIncomes.sort((a, b) => {
                let valA = a[sortConfig.field];
                let valB = b[sortConfig.field];

                if (sortConfig.field === 'amount') {
                    valA = parseFloat(valA);
                    valB = parseFloat(valB);
                } else if (sortConfig.field === 'date') {
                    // Asumimos que la fecha ya está en un formato comparable o es un objeto Date
                    // Si es string, puede necesitar new Date(valA) vs new Date(valB)
                    valA = new Date(valA);
                    valB = new Date(valB);
                }

                if (valA < valB) return sortConfig.order === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.order === 'asc' ? 1 : -1;
                return 0;
            });
        }
        setDisplayedIncomes(processedIncomes);
    }, [incomes, sortConfig, filterCategory]);

    const handleOpenAddIncomeModal = () => {
        setIncomeToEdit(null); 
        setIsAddIncomeModalOpen(true);
    };
    const handleCloseAddIncomeModal = () => {
        setIsAddIncomeModalOpen(false);
        setIncomeToEdit(null); 
    };

    const handleIncomeAdded = async (incomeData) => {
        try {
            await addIncome(incomeData);
            setSnackbar({ open: true, message: 'Ingreso registrado exitosamente.', severity: 'success' });
            fetchIncomes(); 
            handleCloseAddIncomeModal();
        } catch (apiError) {
            console.error("Error al registrar el ingreso:", apiError);
            const errorMessages = Object.values(apiError).flat().join(' ');
            setSnackbar({ open: true, message: errorMessages || 'Error al registrar el ingreso.', severity: 'error' });
        }
    };

    // Funciones para Edición
    const handleOpenEditModal = (income) => {
        setIncomeToEdit(income);
        setIsAddIncomeModalOpen(true);
    };

    const handleIncomeUpdated = async (incomeId, updatedData) => {
        try {
            await apiUpdateIncome(incomeId, updatedData);
            setSnackbar({ open: true, message: 'Ingreso actualizado exitosamente.', severity: 'success' });
            fetchIncomes(); 
            handleCloseAddIncomeModal();
        } catch (apiError) {
            console.error("Error al actualizar el ingreso:", apiError);
            const errorMessages = Object.values(apiError).flat().join(' ');
            setSnackbar({ open: true, message: errorMessages || 'Error al actualizar el ingreso.', severity: 'error' });
        }
    };

    // Funciones para el diálogo de eliminación
    const handleOpenDeleteDialog = (income) => {
        setIncomeToDelete(income);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setIncomeToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!incomeToDelete) return;
        try {
            await apiDeleteIncome(incomeToDelete.id);
            setSnackbar({ open: true, message: 'Ingreso eliminado exitosamente.', severity: 'success' });
            fetchIncomes(); 
        } catch (apiError) {
            console.error("Error al eliminar el ingreso:", apiError);
            const errorMessage = apiError.detail || apiError.message || 'Error al eliminar el ingreso.';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
        handleCloseDeleteDialog();
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ open: false, message: '', severity: 'success' });
    };

    // Helper para formatear fecha (puedes moverlo a un archivo de utils si lo usas en más sitios)
    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Helper para formatear moneda
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'Monto no disponible';
        return `S/ ${value.toFixed(2)}`;
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestión de Ingresos
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleOutlineIcon />}
                    onClick={handleOpenAddIncomeModal}
                >
                    Registrar Nuevo Ingreso
                </Button>
            </Box>

            {/* Controles de Filtro y Ordenamiento */}
            <Box sx={{ my: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: '4px' }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel>Ordenar por</InputLabel>
                            <Select
                                value={sortConfig.field}
                                onChange={(e) => setSortConfig(prev => ({ ...prev, field: e.target.value }))}
                                label="Ordenar por"
                            >
                                <MenuItem value="date">Fecha</MenuItem>
                                <MenuItem value="amount">Monto</MenuItem>
                                <MenuItem value="description">Descripción</MenuItem> 
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel>Orden</InputLabel>
                            <Select
                                value={sortConfig.order}
                                onChange={(e) => setSortConfig(prev => ({ ...prev, order: e.target.value }))}
                                label="Orden"
                            >
                                <MenuItem value="asc">Ascendente</MenuItem>
                                <MenuItem value="desc">Descendente</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Autocomplete
                            options={categories}
                            getOptionLabel={(option) => option.name || ''}
                            value={filterCategory}
                            onChange={(event, newValue) => {
                                setFilterCategory(newValue);
                            }}
                            loading={loadingCategories}
                            loadingText="Cargando categorías..."
                            noOptionsText={categoryError || "No hay categorías disponibles"}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Filtrar por Categoría"
                                    variant="outlined"
                                    size="small"
                                    error={Boolean(categoryError)}
                                    helperText={categoryError}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            sx={{ minWidth: 200 }}
                        />
                    </Grid>
                </Grid>
            </Box>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && (
                <Typography color="error" sx={{ my: 2 }}>
                    {error}
                </Typography>
            )}
            {!loading && !error && displayedIncomes.length === 0 && (
                <Typography sx={{ my: 2 }}>
                    {filterCategory || sortConfig.field !== 'date' ? 'No hay ingresos que coincidan con los filtros/orden actual.' : 'No tienes ingresos registrados. ¡Añade uno para empezar!'}
                </Typography>
            )}
            {!loading && !error && displayedIncomes.length > 0 && (
                <Paper elevation={2}>
                    <List>
                        {displayedIncomes.map((income, index) => (
                            <React.Fragment key={income.id}>
                                <ListItem>
                                    <ListItemText 
                                        primary={`${income.description || 'Ingreso sin descripción'} - ${formatCurrency(parseFloat(income.amount))}`}
                                        secondary={`Categoría: ${income.category_name || 'No especificada'} | Fecha: ${formatDate(income.date)}`}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditModal(income)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(income)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </ListItem>
                                {index < displayedIncomes.length - 1 && <Divider />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

            <AddIncomeModal
                open={isAddIncomeModalOpen}
                onClose={handleCloseAddIncomeModal}
                onIncomeAdded={handleIncomeAdded}
                onIncomeUpdated={handleIncomeUpdated} 
                incomeToEdit={incomeToEdit} 
            />

            {/* Confirmation Dialog for Delete */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title-income"
                aria-describedby="alert-dialog-description-income"
            >
                <DialogTitle id="alert-dialog-title-income">
                    {"Confirmar Eliminación de Ingreso"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description-income">
                        ¿Estás seguro de que quieres eliminar el ingreso "{incomeToDelete?.description}"? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
                    <Button onClick={handleConfirmDelete} color="error" autoFocus>
                        Eliminar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar para notificaciones */}
            {snackbar.open && (
                <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>
                    {snackbar.message}
                </Alert>
            )}
        </Box>
    );
}

export default IncomesPage;

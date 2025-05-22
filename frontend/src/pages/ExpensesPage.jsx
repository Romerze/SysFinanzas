import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Alert,
    Container,
    Grid,
    Card,
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl, 
    InputLabel,  
    Select,      
    MenuItem,    
    Autocomplete, 
    TextField    
} from '@mui/material';
import { green, red, blue } from '@mui/material/colors';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddExpenseModal from '../components/AddExpenseModal'; 
import {
    getExpenses,
    addExpense,
    getIncomes,
    deleteExpense as apiDeleteExpense,
    updateExpense as apiUpdateExpense,
    getCategories 
} from '../services/apiService'; 
import { formatCurrency, formatDate } from '../utils/formattingUtils';

function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [displayedExpenses, setDisplayedExpenses] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [financialSummary, setFinancialSummary] = useState({
        totalIncomes: 0,
        totalExpenses: 0,
        balance: 0,
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [expenseToEdit, setExpenseToEdit] = useState(null); 

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

    const fetchFinancialData = useCallback(async () => {
        setLoading(true);
        try {
            const [expensesData, incomesData] = await Promise.all([
                getExpenses(),
                getIncomes()
            ]);

            setExpenses(expensesData || []);
            
            let currentTotalIncomes = 0;
            if (incomesData && incomesData.length > 0) {
                currentTotalIncomes = incomesData.reduce((sum, income) => {
                    const amount = parseFloat(income.amount);
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0);
            }

            let currentTotalExpenses = 0;
            if (expensesData && expensesData.length > 0) {
                currentTotalExpenses = expensesData.reduce((sum, expense) => {
                    const amount = parseFloat(expense.amount);
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0);
            }

            setFinancialSummary({
                totalIncomes: currentTotalIncomes,
                totalExpenses: currentTotalExpenses,
                balance: currentTotalIncomes - currentTotalExpenses,
            });

            setError(null);
        } catch (err) {
            console.error("Error fetching financial data:", err);
            setError(err.message || 'No se pudieron cargar los datos financieros.');
            setExpenses([]);
            setFinancialSummary({ totalIncomes: 0, totalExpenses: 0, balance: 0 });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFinancialData();
    }, [fetchFinancialData]);

    // Efecto para actualizar displayedExpenses
    useEffect(() => {
        let processedExpenses = [...expenses];

        // Filtrar por categoría
        if (filterCategory) {
            processedExpenses = processedExpenses.filter(expense => expense.category === filterCategory.id);
        }

        // Ordenar
        if (sortConfig.field) {
            processedExpenses.sort((a, b) => {
                let valA = a[sortConfig.field];
                let valB = b[sortConfig.field];

                if (sortConfig.field === 'amount') {
                    valA = parseFloat(valA);
                    valB = parseFloat(valB);
                } else if (sortConfig.field === 'date') {
                    valA = new Date(valA);
                    valB = new Date(valB);
                }

                if (valA < valB) return sortConfig.order === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.order === 'asc' ? 1 : -1;
                return 0;
            });
        }
        setDisplayedExpenses(processedExpenses);
    }, [expenses, sortConfig, filterCategory]);

    const handleOpenAddModal = () => { 
        setExpenseToEdit(null); 
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => { 
        setIsAddModalOpen(false);
        setExpenseToEdit(null); 
    };

    const handleExpenseAdded = async (expenseData) => {
        try {
            await addExpense(expenseData); 
            setSnackbar({ open: true, message: '¡Gasto registrado exitosamente!', severity: 'success' });
            fetchFinancialData(); 
            handleCloseAddModal();
        } catch (apiError) {
            console.error("Error al registrar el gasto:", apiError);
            const errorMessage = apiError.detail || apiError.message || 'Error al registrar el gasto.';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
    };

    const handleOpenEditModal = (expense) => {
        setExpenseToEdit(expense);
        setIsAddModalOpen(true); 
    };

    const handleExpenseUpdated = async (expenseId, updatedData) => {
        try {
            await apiUpdateExpense(expenseId, updatedData);
            setSnackbar({ open: true, message: 'Gasto actualizado exitosamente.', severity: 'success' });
            fetchFinancialData();
            handleCloseAddModal();
        } catch (apiError) {
            console.error("Error al actualizar el gasto:", apiError);
            const errorMessage = apiError.detail || apiError.message || 'Error al actualizar el gasto.';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
    };

    const handleOpenDeleteDialog = (expense) => {
        setExpenseToDelete(expense);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setExpenseToDelete(null);
        setDeleteDialogOpen(false);
    };

    const handleConfirmDelete = async () => {
        if (!expenseToDelete) return;
        try {
            await apiDeleteExpense(expenseToDelete.id);
            setSnackbar({ open: true, message: 'Gasto eliminado exitosamente.', severity: 'success' });
            fetchFinancialData(); 
        } catch (apiError) {
            console.error("Error al eliminar el gasto:", apiError);
            const errorMessage = apiError.detail || apiError.message || 'Error al eliminar el gasto.';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
        handleCloseDeleteDialog();
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Gestión de Gastos
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={handleOpenAddModal} 
                >
                    Registrar Nuevo Gasto
                </Button>
            </Box>

            {/* Sección de Resumen Financiero */}
            {!loading && !error && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: green[50], color: green[700] }}>
                            <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h6" component="div">Ingresos Totales</Typography>
                                <Typography variant="h4">{formatCurrency(financialSummary.totalIncomes)}</Typography>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: red[50], color: red[700] }}>
                            <TrendingDownIcon sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h6" component="div">Gastos Totales</Typography>
                                <Typography variant="h4">{formatCurrency(financialSummary.totalExpenses)}</Typography>
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={12} md={4}>
                        <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: blue[50], color: blue[700] }}>
                            <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2 }} />
                            <Box>
                                <Typography variant="h6" component="div">Balance Disponible</Typography>
                                <Typography variant="h4">{formatCurrency(financialSummary.balance)}</Typography>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            )}

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
                <Alert severity="error" sx={{ my: 2 }}>
                    {error}
                </Alert>
            )}
            {!loading && !error && displayedExpenses.length === 0 && (
                <Typography sx={{ textAlign: 'center', my: 3 }}>
                    {filterCategory || sortConfig.field !== 'date' ? 'No hay gastos que coincidan con los filtros/orden actual.' : 'Aún no has registrado ningún gasto.'}
                </Typography>
            )}
            {!loading && !error && displayedExpenses.length > 0 && (
                <Paper elevation={3}>
                    <List>
                        {displayedExpenses.map((expense, index) => (
                            <React.Fragment key={expense.id}>
                                <ListItem>
                                    <ListItemText
                                        primary={`${expense.description || 'Gasto sin descripción'} - ${formatCurrency(parseFloat(expense.amount))}`}
                                        secondary={`Categoría: ${expense.category_name || 'No especificada'} | Fecha: ${formatDate(expense.date)}`}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditModal(expense)}> 
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleOpenDeleteDialog(expense)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </ListItem>
                                {index < displayedExpenses.length - 1 && <hr />}
                            </React.Fragment>
                        ))}
                    </List>
                </Paper>
            )}

            {/* Modal para Añadir/Editar Gastos */}
            <AddExpenseModal 
                open={isAddModalOpen}
                onClose={handleCloseAddModal}
                onExpenseAdded={handleExpenseAdded} 
                onExpenseUpdated={handleExpenseUpdated} 
                expenseToEdit={expenseToEdit} 
            />

            {/* Confirmation Dialog for Delete */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirmar Eliminación"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        ¿Estás seguro de que quieres eliminar el gasto "{expenseToDelete?.description}"? Esta acción no se puede deshacer.
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
                <Alert 
                    onClose={handleCloseSnackbar} 
                    severity={snackbar.severity} 
                    sx={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 1500 }}
                >
                    {snackbar.message}
                </Alert>
            )}
        </Container>
    );
}

export default ExpensesPage;

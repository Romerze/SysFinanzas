import React, { useState, useEffect } from 'react';
import {
    getIncomes,
    getExpenses,
    getExpenseCategorySummary,
    getIncomeCategorySummary
} from '../services/apiService';
import {
    Typography,
    Box,
    Grid,
    Card,
    CircularProgress,
    Paper
} from '@mui/material';
import { green, red, blue } from '@mui/material/colors';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale
} from 'chart.js';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale
);

function DashboardPage() {
    const [summaryData, setSummaryData] = useState({
        ingresos: 0,
        gastos: 0,
        balance: 0
    });
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [errorSummary, setErrorSummary] = useState(null);
    const [expenseChartData, setExpenseChartData] = useState(null);
    const [incomeChartData, setIncomeChartData] = useState(null);
    const [error, setError] = useState('');

    const formatCurrency = (value) => {
        return `S/ ${value.toFixed(2)}`;
    };

    const fetchSummaryData = async () => {
        setLoadingSummary(true);
        setErrorSummary(null);
        try {
            const [incomesData, expensesData] = await Promise.all([
                getIncomes(),
                getExpenses()
            ]);

            let totalIncomes = 0;
            if (incomesData && incomesData.length > 0) {
                totalIncomes = incomesData.reduce((sum, income) => {
                    const amount = parseFloat(income.amount);
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0);
            }

            let totalExpenses = 0;
            if (expensesData && expensesData.length > 0) {
                totalExpenses = expensesData.reduce((sum, expense) => {
                    const amount = parseFloat(expense.amount);
                    return sum + (isNaN(amount) ? 0 : amount);
                }, 0);
            }
            
            setSummaryData({
                ingresos: totalIncomes,
                gastos: totalExpenses,
                balance: totalIncomes - totalExpenses
            });

        } catch (error) {
            console.error("Error fetching summary data:", error);
            setErrorSummary("No se pudo cargar el resumen financiero.");
            setSummaryData({ ingresos: 0, gastos: 0, balance: 0 });
        } finally {
            setLoadingSummary(false);
        }
    };

    const fetchExpenseChartData = async () => {
        try {
            const rawData = await getExpenseCategorySummary();
            if (rawData && rawData.length > 0) {
                const labels = rawData.map(item => item.category_name);
                const dataValues = rawData.map(item => item.total_amount);
                
                setExpenseChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Gastos por Categoría',
                            data: dataValues,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.7)',
                                'rgba(54, 162, 235, 0.7)',
                                'rgba(255, 206, 86, 0.7)',
                                'rgba(75, 192, 192, 0.7)',
                                'rgba(153, 102, 255, 0.7)',
                                'rgba(255, 159, 64, 0.7)',
                                'rgba(199, 199, 199, 0.7)',
                                'rgba(83, 102, 255, 0.7)',
                                'rgba(40, 159, 64, 0.7)',
                                'rgba(210, 99, 132, 0.7)',
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(199, 199, 199, 1)',
                                'rgba(83, 102, 255, 1)',
                                'rgba(40, 159, 64, 1)',
                                'rgba(210, 99, 132, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                });
            } else {
                setExpenseChartData(null);
            }
        } catch (err) {
            setError(prevError => prevError + '\nError al cargar datos del gráfico de gastos: ' + (err.response?.data?.detail || err.message));
            console.error("Error fetching expense chart data:", err);
        }
    };

    const fetchIncomeChartData = async () => {
        try {
            const rawData = await getIncomeCategorySummary();
            if (rawData && rawData.length > 0) {
                const labels = rawData.map(item => item.category_name);
                const dataValues = rawData.map(item => item.total_amount);
                
                setIncomeChartData({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Ingresos por Categoría',
                            data: dataValues,
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.7)',
                                'rgba(153, 102, 255, 0.7)',
                                'rgba(255, 159, 64, 0.7)',
                                'rgba(255, 99, 132, 0.7)',
                                'rgba(54, 162, 235, 0.7)',
                                'rgba(255, 206, 86, 0.7)',
                                'rgba(199, 199, 199, 0.7)',
                                'rgba(83, 102, 255, 0.7)',
                                'rgba(40, 159, 64, 0.7)',
                                'rgba(210, 99, 132, 0.7)',
                            ],
                            borderColor: [
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(199, 199, 199, 1)',
                                'rgba(83, 102, 255, 1)',
                                'rgba(40, 159, 64, 1)',
                                'rgba(210, 99, 132, 1)',
                            ],
                            borderWidth: 1,
                        },
                    ],
                });
            } else {
                setIncomeChartData(null);
            }
        } catch (err) {
            setError(prevError => prevError + '\nError al cargar datos del gráfico de ingresos: ' + (err.response?.data?.detail || err.message));
            console.error("Error fetching income chart data:", err);
        }
    };

    useEffect(() => {
        fetchSummaryData();
        fetchExpenseChartData();
        fetchIncomeChartData();
    }, []);

    const commonChartOptions = (titleText) => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: titleText,
                font: {
                    size: 16
                }
            },
        },
    });

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">
                    ¡Bienvenido a tu panel de control!
                </Typography>
            </Box>
            <Typography variant="body1" sx={{ mb: 4 }}>
                Aquí podrás visualizar y gestionar tus ingresos, gastos, presupuestos y mucho más.
            </Typography>

            {loadingSummary && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            )}
            {errorSummary && (
                <Typography color="error" sx={{ my: 2, textAlign: 'center' }}>
                    {errorSummary}
                </Typography>
            )}

            {!loadingSummary && !errorSummary && (
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: green[50], color: green[700] }}>
                                    <TrendingUpIcon sx={{ fontSize: 40, mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" component="div">Ingresos Totales</Typography>
                                        <Typography variant="h4">{formatCurrency(summaryData.ingresos)}</Typography>
                                    </Box>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: red[50], color: red[700] }}>
                                    <TrendingDownIcon sx={{ fontSize: 40, mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" component="div">Gastos Totales</Typography>
                                        <Typography variant="h4">{formatCurrency(summaryData.gastos)}</Typography>
                                    </Box>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Card sx={{ display: 'flex', alignItems: 'center', p: 2, backgroundColor: blue[50], color: blue[700] }}>
                                    <AccountBalanceWalletIcon sx={{ fontSize: 40, mr: 2 }} />
                                    <Box>
                                        <Typography variant="h6" component="div">Balance Actual</Typography>
                                        <Typography variant="h4">{formatCurrency(summaryData.balance)}</Typography>
                                    </Box>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={3}>
                            {expenseChartData && (
                                <Grid item xs={12} md={6}> 
                                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
                                        <Box sx={{ height: '100%', width: '100%' }}> 
                                            <Pie data={expenseChartData} options={commonChartOptions('Distribución de Gastos por Categoría')} />
                                        </Box>
                                    </Paper>
                                </Grid>
                            )}
                            {incomeChartData && (
                                <Grid item xs={12} md={6}> 
                                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 400 }}>
                                        <Box sx={{ height: '100%', width: '100%' }}>
                                            <Pie data={incomeChartData} options={commonChartOptions('Distribución de Ingresos por Categoría')} />
                                        </Box>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}

export default DashboardPage;

import axios from 'axios';

const API_URL = 'http://localhost:8000/api'; // URL base de tu API Django

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para añadir el token JWT a las cabeceras si está disponible
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const loginUser = async (credentials) => {
    try {
        const payload = {
            username: credentials.email, 
            password: credentials.password,
        };
        const response = await apiClient.post('/token/', payload); 
        if (response.data.access) {
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
        }
        return response.data;
    } catch (error) {
        console.error("Error en el login:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const registerUser = async (userData) => {
    try {
        // El endpoint de registro es '/accounts/register/'
        const response = await apiClient.post('/accounts/register/', userData);
        return response.data;
    } catch (error) {
        console.error("Error en el registro:", error.response ? error.response.data : error.message);
        throw error;
    }
};

export const refreshToken = async () => {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) {
        throw new Error("No refresh token available");
    }
    try {
        const response = await apiClient.post('/token/refresh/', { refresh });
        if (response.data.access) {
            localStorage.setItem('accessToken', response.data.access);
        }
        return response.data;
    } catch (error) {
        console.error("Error refrescando token:", error.response ? error.response.data : error.message);
        // Podríamos limpiar localStorage aquí si el refresh token es inválido
        // localStorage.removeItem('accessToken');
        // localStorage.removeItem('refreshToken');
        throw error;
    }
};

export const logoutUser = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Aquí podrías llamar a un endpoint de blacklist si lo implementaste
    // Por ahora, solo limpia el storage local
};

// Funciones para Ingresos
export const addIncome = async (incomeData) => {
    try {
        const response = await apiClient.post('/transactions/incomes/', incomeData);
        return response.data;
    } catch (error) {
        console.error("Error adding income:", error.response ? error.response.data : error.message);
        // Devolver el objeto de error completo del backend si está disponible
        if (error.response && error.response.data) {
            throw error.response.data;
        }
        throw new Error('Error al registrar el ingreso');
    }
};

export const updateIncome = async (incomeId, incomeData) => {
    try {
        const payload = {
            ...incomeData,
            amount: parseFloat(incomeData.amount),
        };
        const response = await apiClient.put(`/transactions/incomes/${incomeId}/`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error updating income ${incomeId}:`, error.response ? error.response.data : error.message);
        if (error.response && error.response.data) {
            const errorMessages = Object.values(error.response.data).flat().join(' ');
            throw new Error(errorMessages || 'Error al actualizar el ingreso.');
        }
        throw new Error('Error al actualizar el ingreso.');
    }
};

export const deleteIncome = async (incomeId) => {
    try {
        await apiClient.delete(`/transactions/incomes/${incomeId}/`);
        // Las operaciones DELETE exitosas a menudo devuelven un status 204 No Content
        // No necesariamente hay un `response.data` para retornar.
        return { success: true, message: 'Ingreso eliminado correctamente' }; 
    } catch (error) {
        console.error(`Error deleting income ${incomeId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al eliminar el ingreso');
    }
};

// --- Funciones para Gastos ---

// Función para registrar un nuevo gasto
export const addExpense = async (expenseData) => {
    try {
        // Asumimos que el backend espera 'category_name' como en addIncome
        // y que el endpoint es /transactions/expenses/
        // Si el backend espera el ID de la categoría, esto necesitará ajustarse.
        const payload = {
            ...expenseData,
            amount: parseFloat(expenseData.amount), // Asegurar que el monto sea un número
            // category: expenseData.category_id, // Si el backend espera el ID de la categoría
        };
        const response = await apiClient.post('/transactions/expenses/', payload);
        return response.data;
    } catch (error) {
        console.error("Error adding expense:", error.response ? error.response.data : error.message);
        // Propagar el error para que el componente pueda manejarlo (ej. mostrar un mensaje al usuario)
        throw error.response ? error.response.data : new Error('Error al registrar el gasto');
    }
};

// Función para obtener todos los gastos del usuario
export const getExpenses = async () => {
    try {
        const response = await apiClient.get('/transactions/expenses/');
        return response.data;
    } catch (error) {
        console.error("Error fetching expenses:", error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al obtener los gastos');
    }
};

// Podrías añadir más funciones como updateExpense, deleteExpense, etc. aquí en el futuro.
export const deleteExpense = async (expenseId) => {
    try {
        const response = await apiClient.delete(`/transactions/expenses/${expenseId}/`);
        return response.data; // O response.status si el backend no devuelve contenido en DELETE
    } catch (error) {
        console.error(`Error deleting expense ${expenseId}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al eliminar el gasto');
    }
};

export const updateExpense = async (expenseId, expenseData) => {
    try {
        // Asegurarse de que el monto sea un número si es necesario
        const payload = {
            ...expenseData,
            amount: parseFloat(expenseData.amount), 
        };
        // Si category_id es parte de expenseData y es lo que espera el backend, está bien.
        // Si el backend espera 'category' como un ID, y tienes 'category_id' en expenseData,
        // podrías necesitar renombrarlo o ajustar el payload aquí.
        // Por ahora, asumimos que expenseData ya tiene el formato correcto (ej. con category_id).
        const response = await apiClient.put(`/transactions/expenses/${expenseId}/`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error updating expense ${expenseId}:`, error.response ? error.response.data : error.message);
        // Intentar devolver mensajes de error específicos del backend si están disponibles
        if (error.response && error.response.data) {
            const errorMessages = Object.values(error.response.data).flat().join(' ');
            throw new Error(errorMessages || 'Error al actualizar el gasto.');
        }
        throw new Error('Error al actualizar el gasto.');
    }
};

// User Profile Management
export const getUserProfile = async () => {
    const response = await apiClient.get('/accounts/me/');
    return response.data;
};

export const updateUserProfile = async (profileData) => {
    const response = await apiClient.put('/accounts/me/', profileData);
    return response.data;
};

export const changePassword = async (passwordData) => {
    // passwordData should be an object like: { old_password, new_password1, new_password2 }
    const response = await apiClient.post('/accounts/change-password/', passwordData);
    return response.data;
};

// Nueva función para obtener el resumen de gastos por categoría
export const getExpenseCategorySummary = async () => {
    const response = await apiClient.get('transactions/summary/expenses-by-category/');
    return response.data;
};

// Nueva función para obtener el resumen de INGRESOS por categoría
export const getIncomeCategorySummary = async () => {
    const response = await apiClient.get('transactions/summary/incomes-by-category/');
    return response.data;
};

// Categorías
export const getCategories = async () => {
    try {
        const response = await apiClient.get('/transactions/categories/');
        return response.data; // Esto debería ser un array de objetos categoría
    } catch (error) {
        console.error("Error al obtener las categorías:", error.response ? error.response.data : error.message);
        throw error; 
    }
};

export const createCategory = async (categoryData) => {
    try {
        const response = await apiClient.post('/transactions/categories/', categoryData);
        return response.data; // Devuelve el objeto de la categoría creada
    } catch (error) {
        console.error("Error al crear la categoría:", error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al crear la categoría');
    }
};

export const updateCategory = async (id, categoryData) => {
    const response = await apiClient.put(`transactions/categories/${id}/`, categoryData);
    return response.data;
};

export const deleteCategory = async (id) => {
    const response = await apiClient.delete(`transactions/categories/${id}/`);
    return response.data; // O response.status si no hay contenido en la respuesta
};

// INGRESOS
export const getIncomes = async (filters = {}) => {
    try {
        const response = await apiClient.get('/transactions/incomes/', { params: filters });
        return response.data;
    } catch (error) {
        console.error("Error fetching incomes:", error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Error al obtener los ingresos');
    }
};

export default apiClient;

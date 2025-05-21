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


// Aquí podrías añadir más funciones para otros endpoints (ingresos, categorías, etc.)
// Por ejemplo:
// export const getIncomes = async (filters = {}) => {
//     try {
//         const response = await apiClient.get('/transactions/incomes/', { params: filters });
//         return response.data;
//     } catch (error) {
//         console.error("Error obteniendo ingresos:", error.response ? error.response.data : error.message);
//         throw error;
//     }
// };

export default apiClient;

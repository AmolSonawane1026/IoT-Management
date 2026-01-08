import axios from 'axios';

// Mode switching: development = localhost, production = live URL
const API_BASE_URL = import.meta.env.VITE_MODE === 'development'
    ? 'http://localhost:5000/api'
    : 'https://iot-management-backend.onrender.com/api';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;

import axiosInstance from './axiosInstance';

const login = async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
};

const register = async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
};

export default {
    login,
    register,
};

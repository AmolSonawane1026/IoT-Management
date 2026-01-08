import axiosInstance from './axiosInstance';

const getDevices = async (params) => {
    const response = await axiosInstance.get('/devices', { params });
    return response.data;
};

const deleteDevice = async (id) => {
    const response = await axiosInstance.delete(`/devices/${id}`);
    return response.data;
};

const toggleDeviceStatus = async (id, isOnline) => {
    const response = await axiosInstance.patch(`/devices/status/${id}`, { isOnline });
    return response.data;
};

const getTelemetry = async (id) => {
    const response = await axiosInstance.get(`/devices/telemetry/${id}`);
    return response.data;
};

export default {
    getDevices,
    deleteDevice,
    toggleDeviceStatus,
    getTelemetry,
};

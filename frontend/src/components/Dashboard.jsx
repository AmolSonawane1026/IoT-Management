import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import deviceService from '../services/deviceService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { LayoutDashboard, Activity, Wifi, Battery, Zap } from 'lucide-react';
import DeviceCard from './DeviceCard.jsx';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [devices, setDevices] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [selectedDeviceName, setSelectedDeviceName] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const selectedDeviceIdRef = useRef(selectedDeviceId);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    useEffect(() => {
        selectedDeviceIdRef.current = selectedDeviceId;
    }, [selectedDeviceId]);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        setUser(userData);

        // Mode switching: development = localhost, production = live URL
        const SOCKET_URL = import.meta.env.VITE_MODE === 'development'
            ? 'http://localhost:5000'
            : 'https://iot-management-backend.onrender.com';

        const socket = io(SOCKET_URL);

        socket.on('connect', () => {
            console.log("Custom Socket Connected:", socket.id);
        });

        socket.on('telemetry_data', (payload) => {
            setDevices(prevDevices => prevDevices.map(d =>
                d.id === payload.deviceId
                    ? {
                        ...d,
                        isOnline: true,
                        lastSeen: new Date(),
                        telemetry: [...(d.telemetry || []), payload.data].slice(-20)
                    }
                    : d
            ));

            if (selectedDeviceIdRef.current === payload.deviceId) {
                setChartData(prev => {
                    const newData = [...prev, payload.data];
                    return newData.slice(-30);
                });
            }
        });

        socket.on('device_deleted', (deletedId) => {
            setDevices(prev => prev.filter(d => d.id !== deletedId));
            if (selectedDeviceIdRef.current === deletedId) {
                setSelectedDeviceId(null);
                setChartData([]);
            }
        });

        socket.on('device_updated', (updatedDevice) => {
            setDevices(prev => prev.map(d => d.id === updatedDevice.id ? { ...d, ...updatedDevice } : d));
        });

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        fetchDevices();
    }, [debouncedSearch, statusFilter]);

    const fetchDevices = async () => {
        try {
            const params = {};
            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter !== 'all') params.status = statusFilter;

            const data = await deviceService.getDevices(params);
            setDevices(data.devices);
            setCurrentPage(1);
        } catch (err) {
            console.error("Error fetching devices", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this device?")) return;
        try {
            await deviceService.deleteDevice(id);
        } catch (err) {
            alert("Only Admins can delete devices.");
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        setDevices(prev => prev.map(d => d.id === id ? { ...d, isOnline: !currentStatus } : d));

        try {
            await deviceService.toggleDeviceStatus(id, !currentStatus);
        } catch (err) {
            console.error("Error updating status", err);
            setDevices(prev => prev.map(d => d.id === id ? { ...d, isOnline: currentStatus } : d));
        }
    };

    const handleViewChart = async (id) => {
        setSelectedDeviceId(id);
        const device = devices.find(d => d.id === id);
        if (device) setSelectedDeviceName(device.name);

        try {
            const data = await deviceService.getTelemetry(id);
            setChartData(data);
        } catch (err) {
            console.error(err);
        }
    };

    const totalPages = Math.ceil(devices.length / itemsPerPage);
    const paginatedDevices = devices.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const onlineDevicesCount = devices.filter(d => d.isOnline).length;
    const totalDevicesCount = devices.length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-orange-50/40 to-blue-50/30 text-slate-900 overflow-x-hidden flex flex-col relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-200/20 via-transparent to-blue-200/20 pointer-events-none"></div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-200/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>
            <Navbar />

            <div className="flex-1 max-w-7xl mx-auto px-6 py-10 w-full relative z-10">

                <div className="mb-10">
                    <div className="relative bg-gradient-to-br from-orange-50 via-white to-orange-100/50 backdrop-blur-xl rounded-3xl border-2 border-white/80 shadow-2xl p-8 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-300/20 to-transparent rounded-full blur-2xl"></div>

                        <div className="absolute top-6 right-8 opacity-20">
                            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="40" cy="40" r="8" fill="#f97316" opacity="0.6" />
                                <circle cx="70" cy="30" r="6" fill="#fb923c" opacity="0.5" />
                                <circle cx="90" cy="50" r="5" fill="#fdba74" opacity="0.4" />
                                <circle cx="60" cy="70" r="7" fill="#f97316" opacity="0.5" />
                                <path d="M20 80 Q 40 60, 60 80 T 100 80" stroke="#f97316" strokeWidth="3" fill="none" opacity="0.3" />
                                <path d="M30 90 Q 50 70, 70 90 T 110 90" stroke="#fb923c" strokeWidth="2" fill="none" opacity="0.3" />
                            </svg>
                        </div>

                        <div className="absolute bottom-8 right-12 opacity-15">
                            <svg width="150" height="100" viewBox="0 0 150 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <ellipse cx="75" cy="80" rx="60" ry="15" fill="#f97316" opacity="0.3" />
                                <path d="M 30 60 Q 50 20, 70 60 T 110 60" fill="#fb923c" opacity="0.4" />
                                <circle cx="50" cy="40" r="3" fill="#fdba74" />
                                <circle cx="80" cy="35" r="4" fill="#f97316" />
                                <circle cx="100" cy="45" r="3" fill="#fb923c" />
                            </svg>
                        </div>

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-slate-800 mb-1">
                                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user?.name}
                                </h2>
                                <p className="text-slate-600 text-sm font-medium mb-4">Welcome back home!</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-slate-900">
                                        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-200/50">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="font-medium">All Systems Operational</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                    <div className="xl:col-span-2 space-y-8">

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="group relative bg-white/85 p-6 rounded-2xl border-2 border-white/70 shadow-xl hover:shadow-2xl hover:bg-white/90 hover:border-white/90 transition-all duration-500 overflow-hidden hover:-translate-y-1">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-orange-400/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                                            <Wifi className="w-7 h-7 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-orange-600 uppercase tracking-wide bg-orange-50 px-3 py-1 rounded-full">Online</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className="text-4xl font-black bg-gradient-to-br from-orange-600 to-orange-500 bg-clip-text text-transparent">{onlineDevicesCount}</span>
                                        <span className="text-lg font-semibold text-slate-400">/ {totalDevicesCount}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500 shadow-sm" style={{ width: `${(onlineDevicesCount / totalDevicesCount) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="group relative bg-white/85 p-6 rounded-2xl border-2 border-white/70 shadow-xl hover:shadow-2xl hover:bg-white/90 hover:border-white/90 transition-all duration-500 overflow-hidden hover:-translate-y-1">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                            <Battery className="w-7 h-7 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wide bg-blue-50 px-3 py-1 rounded-full">Total</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className="text-4xl font-black bg-gradient-to-br from-blue-600 to-blue-500 bg-clip-text text-transparent">{totalDevicesCount}</span>
                                        <span className="text-lg font-semibold text-slate-400">Devices</span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">All registered assets</p>
                                </div>
                            </div>

                            <div className="group relative bg-white/85 p-6 rounded-2xl border-2 border-white/70 shadow-xl hover:shadow-2xl hover:bg-white/90 hover:border-white/90 transition-all duration-500 overflow-hidden hover:-translate-y-1">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-green-400/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                                            <Activity className="w-7 h-7 text-white" />
                                        </div>
                                        <span className="text-xs font-bold text-green-600 uppercase tracking-wide bg-green-50 px-3 py-1 rounded-full">Status</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50 animate-pulse"></div>
                                        <span className="text-xl font-black text-slate-900">Operational</span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">All systems running</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/85 rounded-2xl border-2 border-white/70 shadow-2xl p-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Device Management</h3>
                                    <p className="text-sm text-slate-500 mt-0.5">Monitor and control your connected devices</p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-4 w-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full sm:w-48 pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 sm:text-sm transition-all"
                                            placeholder="Search devices..."
                                            value={searchTerm}
                                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        />
                                    </div>

                                    <select
                                        value={statusFilter}
                                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                                        className="block w-full sm:w-32 pl-3 pr-10 py-2 text-base border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 sm:text-sm rounded-lg bg-white cursor-pointer"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="online">Online Only</option>
                                        <option value="offline">Offline Only</option>
                                    </select>
                                </div>
                            </div>

                            {devices.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-80 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl">
                                    <LayoutDashboard className="w-16 h-16 text-slate-300 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-400">No Devices Found</h3>
                                    <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 min-h-[500px] content-start">
                                        {paginatedDevices.map(device => (
                                            <DeviceCard
                                                key={device.id}
                                                device={device}
                                                isAdmin={user?.role === 'admin'}
                                                onDelete={handleDelete}
                                                onView={handleViewChart}
                                                onToggleStatus={() => handleToggleStatus(device.id, device.isOnline)}
                                            />
                                        ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex justify-center items-center mt-8 gap-2">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            </button>

                                            <div className="flex gap-1">
                                                {[...Array(totalPages)].map((_, i) => (
                                                    <button
                                                        key={i + 1}
                                                        onClick={() => setCurrentPage(i + 1)}
                                                        className={`w-8 h-8 rounded-lg text-sm font-bold transition-all ${currentPage === i + 1
                                                            ? 'bg-orange-500 text-white shadow-md shadow-orange-500/25'
                                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        {i + 1}
                                                    </button>
                                                ))}
                                            </div>

                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="xl:col-span-1">
                        <div className="relative bg-white/85 rounded-2xl border-2 border-white/70 shadow-2xl p-6 sticky top-24 overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-200/40 to-transparent rounded-full blur-3xl animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-3xl"></div>

                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 mb-1">
                                            Analytics
                                        </h2>
                                        {selectedDeviceName ? (
                                            <p className="text-orange-600 text-sm font-bold mt-1 flex items-center gap-2">
                                                <span className="relative flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-lg shadow-green-500/50"></span>
                                                </span>
                                                Monitoring: {selectedDeviceName}
                                            </p>
                                        ) : (
                                            <p className="text-slate-500 text-sm mt-1">Real-time Data Stream</p>
                                        )}
                                    </div>
                                </div>

                                <div className="h-full min-h-[450px] flex flex-col items-center justify-center">
                                    {selectedDeviceId && chartData.length > 0 ? (
                                        <div className="w-full space-y-5">
                                            <div className="group relative bg-gradient-to-br from-orange-50 via-orange-100/50 to-orange-50 p-6 rounded-2xl border border-orange-200/60 hover:border-orange-300/80 transition-all duration-300 overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-300/10 rounded-full blur-xl"></div>

                                                <div className="relative flex flex-col items-center">
                                                    <div className="relative w-48 h-48 mb-3">
                                                        <svg className="transform -rotate-90 w-full h-full drop-shadow-xl">
                                                            <defs>
                                                                <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                    <stop offset="0%" stopColor="#f97316" />
                                                                    <stop offset="50%" stopColor="#fb923c" />
                                                                    <stop offset="100%" stopColor="#ea580c" />
                                                                </linearGradient>
                                                                <filter id="glow">
                                                                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                                                    <feMerge>
                                                                        <feMergeNode in="coloredBlur" />
                                                                        <feMergeNode in="SourceGraphic" />
                                                                    </feMerge>
                                                                </filter>
                                                            </defs>
                                                            <circle
                                                                cx="50%" cy="50%" r="85"
                                                                stroke="#fed7aa" strokeWidth="14" fill="transparent"
                                                            />
                                                            <circle
                                                                cx="50%" cy="50%" r="85"
                                                                stroke="url(#orangeGradient)" strokeWidth="14" fill="transparent"
                                                                strokeDasharray={2 * Math.PI * 85}
                                                                strokeDashoffset={2 * Math.PI * 85 - ((Math.min((chartData[chartData.length - 1].power || 0) / 3000, 1) * 100) / 100) * (2 * Math.PI * 85)}
                                                                strokeLinecap="round"
                                                                className="transition-all duration-1000 ease-out"
                                                                filter="url(#glow)"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-4xl font-black bg-gradient-to-br from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent drop-shadow-sm">
                                                                {(chartData[chartData.length - 1].power || 0).toFixed(2)}
                                                            </span>
                                                            <span className="text-xs font-black text-orange-600 uppercase tracking-widest mt-1">WATTS</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-slate-700 text-sm font-bold">Current Power Load</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="group relative bg-gradient-to-br from-blue-50 via-blue-100/50 to-blue-50 p-6 rounded-2xl border border-blue-200/60 hover:border-blue-300/80 transition-all duration-300 overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-300/10 rounded-full blur-xl"></div>

                                                <div className="relative flex flex-col items-center">
                                                    <div className="relative w-40 h-40 mb-3">
                                                        <svg className="transform -rotate-90 w-full h-full drop-shadow-xl">
                                                            <defs>
                                                                <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                                    <stop offset="0%" stopColor="#3b82f6" />
                                                                    <stop offset="50%" stopColor="#60a5fa" />
                                                                    <stop offset="100%" stopColor="#2563eb" />
                                                                </linearGradient>
                                                            </defs>
                                                            <circle
                                                                cx="50%" cy="50%" r="65"
                                                                stroke="#bfdbfe" strokeWidth="12" fill="transparent"
                                                            />
                                                            <circle
                                                                cx="50%" cy="50%" r="65"
                                                                stroke="url(#blueGradient)" strokeWidth="12" fill="transparent"
                                                                strokeDasharray={2 * Math.PI * 65}
                                                                strokeDashoffset={2 * Math.PI * 65 - ((Math.min((chartData[chartData.length - 1].voltage || 0) / 260, 1) * 100) / 100) * (2 * Math.PI * 65)}
                                                                strokeLinecap="round"
                                                                className="transition-all duration-1000 ease-out"
                                                                filter="url(#glow)"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-3xl font-black bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                                                                {(chartData[chartData.length - 1].voltage || 0).toFixed(2)}
                                                            </span>
                                                            <span className="text-xs font-black text-blue-600 uppercase tracking-widest mt-1">VOLTS</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-slate-700 text-sm font-bold">Voltage Level</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 w-full">
                                            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-white rounded-2xl shadow-md flex items-center justify-center mb-4 mx-auto border border-slate-200">
                                                <Activity className="w-10 h-10 text-slate-400" />
                                            </div>
                                            <h3 className="text-slate-800 font-black text-lg mb-2">No Data Selected</h3>
                                            <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">Select a device card to view its live performance metrics and real-time analytics.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Dashboard;

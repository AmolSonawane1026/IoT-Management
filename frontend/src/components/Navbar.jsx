import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-3 group cursor-pointer">
                    <div className="p-2.5 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                        <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-tight">
                        IoT<span className="text-orange-500">Management</span>
                    </h1>
                </div>

                <button
                    onClick={handleLogout}
                    className="group flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-orange-500 hover:text-white transition-all duration-300 font-semibold text-sm border border-slate-700 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 active:scale-95"
                >
                    <svg
                        className="w-4 h-4 transition-transform group-hover:-translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

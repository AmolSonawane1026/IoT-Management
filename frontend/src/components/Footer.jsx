import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
            <div className="container mx-auto px-6 py-10">
                <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-black text-white text-center">
                            IoT<span className="text-orange-500">Management</span>
                        </h3>
                        <p className="text-slate-500 text-sm mt-3 max-w-xs font-medium text-center">
                            Monitor, track, and manage your IoT devices with real-time analytics and insights.
                        </p>
                    </div>

                    
                </div>

                <div className="border-t border-slate-800 mt-8 pt-8 text-center">
                    <p className="text-slate-600 text-xs font-semibold uppercase tracking-widest">
                        &copy; 2026 IoT Asset Management Dashboard
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

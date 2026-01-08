import React, { useState } from 'react';
import { Zap, Power, Trash2, Cpu, Activity } from 'lucide-react';

const DeviceCard = ({ device, isAdmin, onDelete, onView, onToggleStatus }) => {
    const history = device.telemetry || [];
    const latest = history.length > 0 ? history[history.length - 1] : { power: 0, voltage: 0 };
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async (e) => {
        e.stopPropagation();
        setIsToggling(true);
        await onToggleStatus(device.id, !device.isOnline);
        setIsToggling(false);
    };

    const currentPower = latest.power || 0;

    return (
        <div className="group relative bg-gradient-to-br from-white to-orange-50/30 rounded-2xl shadow-md hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-500 overflow-hidden border border-slate-200/60 hover:border-orange-200 p-6">

          
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                    
                    <div className={`relative w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold shadow-lg transition-all duration-300 ${device.isOnline
                        ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white'
                        : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-500'
                        }`}>
                        {device.name.charAt(0).toUpperCase()}
                       
                        <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${device.isOnline ? 'bg-green-500' : 'bg-slate-400'
                            }`} />
                    </div>

                   
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{device.name}</h3>
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{device.type}</span>
                    </div>
                </div>

                {isAdmin && (
                    <button
                        onClick={handleToggle}
                        disabled={isToggling}
                        className={`relative h-7 w-12 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${device.isOnline
                            ? 'bg-gradient-to-r from-orange-500 to-amber-600 focus:ring-orange-400'
                            : 'bg-slate-300 focus:ring-slate-400'
                            }`}
                    >
                        <span className={`absolute top-1 bg-white w-5 h-5 rounded-full transition-transform duration-300 shadow-md ${device.isOnline ? 'translate-x-6 left-0.5' : 'translate-x-0 left-1'
                            }`} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="relative bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-3 border border-orange-200/50 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm">
                            <Power className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Power</span>
                    </div>
                    <p className="text-xl font-bold text-slate-800 ml-9">
                        {device.isOnline ? `${currentPower}W` : '--'}
                    </p>
                </div>

                <div className="relative bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-3 border border-amber-200/50 hover:shadow-md transition-shadow duration-300">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Voltage</span>
                    </div>
                    <p className="text-xl font-bold text-slate-800 ml-9">
                        {device.isOnline ? `${latest.voltage || 0}V` : '--'}
                    </p>
                </div>
            </div>

            <button
                onClick={() => onView(device.id)}
                className="w-full py-2.5 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-orange-500 hover:to-amber-600 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-orange-500/30 flex items-center justify-center gap-2 group"
            >
                <Activity className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                View Analytics
            </button>
        </div>
    );
};

export default DeviceCard;

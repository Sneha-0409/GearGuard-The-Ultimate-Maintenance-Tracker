import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { X, Save, Box, AlertTriangle, Calendar as CalIcon } from 'lucide-react';

export default function CreateRequestModal({ isOpen, onClose, initialDate }) {
    const { equipment, teams, addRequest, getTeamName } = useData();
    const [formData, setFormData] = useState({
        subject: '',
        equipmentId: '',
        type: 'Corrective',
        priority: 'Medium',
        date: initialDate || new Date().toISOString().split('T')[0],
        deadline: '',
        teamId: '',
        technician: 'Unassigned',
        company: '', // Added company field
        checklist: []
    });

    const [newSubtask, setNewSubtask] = useState('');

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            setFormData(prev => ({
                ...prev,
                checklist: [...prev.checklist, { text: newSubtask.trim(), isCompleted: false }]
            }));
            setNewSubtask('');
        }
    };

    const removeSubtask = (index) => {
        setFormData(prev => ({
            ...prev,
            checklist: prev.checklist.filter((_, i) => i !== index)
        }));
    };

    useEffect(() => {
        if (isOpen && initialDate) {
            setFormData(prev => ({ ...prev, date: initialDate }));
        }
    }, [isOpen, initialDate]);

    // Auto-fill Logic
    useEffect(() => {
        if (formData.equipmentId) {
            const eq = equipment.find(e => e.id === formData.equipmentId);
            if (eq) {
                setFormData(prev => ({
                    ...prev,
                    teamId: eq.teamId,
                    company: eq.company || 'GearGuard Inc.' // Auto-fill company
                }));
            }
        }
    }, [formData.equipmentId, equipment]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.subject || !formData.equipmentId) return;
        addRequest(formData);
        onClose();
        // Reset form
        setFormData({
            subject: '',
            equipmentId: '',
            type: 'Corrective',
            priority: 'Medium',
            date: new Date().toISOString().split('T')[0],
            teamId: '',
            technician: 'Unassigned',
            company: '',
            checklist: []
        });
        setNewSubtask('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-slate-900 border border-slate-700/50 rounded-2xl w-full max-w-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                    <h3 className="text-xl font-bold text-white">New Request</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Subject / Issue</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                            placeholder="e.g. Hydraulic Leak on Press 1"
                            value={formData.subject}
                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Equipment</label>
                            <div className="relative">
                                <Box size={16} className="absolute left-3 top-3 text-slate-500" />
                                <select
                                    required
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 appearance-none"
                                    value={formData.equipmentId}
                                    onChange={e => setFormData({ ...formData, equipmentId: e.target.value })}
                                >
                                    <option value="">Select Asset</option>
                                    {equipment.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Company</label>
                            <input
                                disabled
                                value={formData.company || 'Auto-filled'}
                                className="w-full bg-slate-800/30 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-500 italic cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Type</label>
                            <select
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 appearance-none"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Corrective">Corrective</option>
                                <option value="Preventive">Preventive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Action Team</label>
                            <input
                                disabled
                                value={getTeamName(formData.teamId) || 'Auto-assigned'}
                                className="w-full bg-slate-800/30 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-500 italic cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Scheduled Date</label>
                            <div className="relative">
                                <CalIcon size={16} className="absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="date"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Deadline (Optional)</label>
                            <div className="relative">
                                <CalIcon size={16} className="absolute left-3 top-3 text-slate-500" />
                                <input
                                    type="date"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-200 focus:outline-none focus:border-red-500 [color-scheme:dark]"
                                    value={formData.deadline || ''}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Priority</label>
                        <div className="flex gap-4">
                            {['Medium', 'High', 'Critical'].map(p => (
                                <label key={p} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${formData.priority === p
                                    ? p === 'Critical' ? 'bg-red-500/20 border-red-500 text-red-400'
                                        : p === 'High' ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                                            : 'bg-blue-500/20 border-blue-500 text-blue-400'
                                    : 'border-slate-700 bg-slate-800/50 text-slate-500 hover:border-slate-600'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="priority"
                                        value={p}
                                        checked={formData.priority === p}
                                        onChange={() => setFormData({ ...formData, priority: p })}
                                        className="hidden"
                                    />
                                    {p === 'Critical' && <AlertTriangle size={14} />}
                                    <span className="text-sm font-medium">{p}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800">
                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Checklist (Sub-tasks)</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                                placeholder="Add a new sub-task..."
                                value={newSubtask}
                                onChange={e => setNewSubtask(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubtask(); } }}
                            />
                            <button
                                type="button"
                                onClick={handleAddSubtask}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium text-sm"
                            >
                                Add
                            </button>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                            {formData.checklist.map((task, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-slate-800/30 border border-slate-700/50 px-3 py-2 rounded-lg group">
                                    <span className="text-sm text-slate-300">{task.text}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeSubtask(idx)}
                                        className="text-slate-500 hover:text-red-400 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-800 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Save Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

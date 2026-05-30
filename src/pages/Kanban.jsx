import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import CreateRequestModal from '../components/CreateRequestModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Calendar, AlertTriangle, User, MoreHorizontal, X, Clock, CheckCircle, Trash2, Check } from 'lucide-react';

const Column = ({ title, stage, count, children, onDrop, onDragOver }) => (
    <div
        onDrop={(e) => onDrop(e, stage)}
        onDragOver={onDragOver}
        className="flex-1 min-w-[300px] flex flex-col h-full glass-panel rounded-xl border-t-4 border-t-transparent data-[stage=New]:border-t-blue-500 data-[stage=Progress]:border-t-amber-500 data-[stage=Repaired]:border-t-emerald-500 data-[stage=Scrap]:border-t-red-500 bg-slate-900/40"
        data-stage={stage === 'In Progress' ? 'Progress' : stage}
    >
        <div className="p-4 flex items-center justify-between border-b border-slate-700/50">
            <h3 className="font-bold text-slate-900 dark:text-slate-200">{title}</h3>
            <span className="bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md text-xs font-mono text-slate-600 dark:text-slate-400">{count}</span>
        </div>
        <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar min-h-[200px]">
            {children}
        </div>
    </div>
);

const Card = ({ request, equipmentName, teamName, category, company, onDragStart, onDelete, onToggleChecklist }) => {
    const isOverdue = ['New', 'In Progress'].includes(request.stage) && new Date(request.date) < new Date('2025-12-27');

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, request.id)}
            className={`bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm cursor-grab active:cursor-grabbing hover:border-slate-500 transition-colors group relative ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
        >
            {isOverdue && (
                <div className="absolute top-0 right-0 p-1 bg-red-500/10 text-red-400 rounded-bl-lg rounded-tr-[calc(0.5rem-1px)]">
                    <AlertTriangle size={12} />
                </div>
            )}

            <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${request.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                    request.priority === 'High' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                    }`}>
                    {request.priority}
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Call the onDelete prop which is passed from the parent
                        onDelete();
                    }}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>

            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1 line-clamp-2">{request.subject}</h4>

            <div className="mb-3 space-y-1">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{equipmentName}</p>
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                    {category && <span className="bg-slate-200 dark:bg-slate-700/50 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400">{category}</span>}
                    {company && <span className="bg-slate-200 dark:bg-slate-700/50 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400">{company}</span>}
                </div>
            </div>

            {request.checklist && request.checklist.length > 0 && (
                <div className="mb-4 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Sub-tasks</span>
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 rounded">
                            {request.checklist.filter(c => c.isCompleted).length}/{request.checklist.length}
                        </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden mb-2.5">
                        <div 
                            className="bg-blue-500 h-full transition-all duration-300 ease-out"
                            style={{ width: `${(request.checklist.filter(c => c.isCompleted).length / request.checklist.length) * 100}%` }}
                        ></div>
                    </div>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                        {request.checklist.map((item, idx) => (
                            <div 
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); onToggleChecklist(idx); }}
                                className="flex items-start gap-2 cursor-pointer group"
                            >
                                <div className={`mt-0.5 min-w-[14px] w-[14px] h-[14px] rounded-[3px] border flex items-center justify-center transition-all duration-200 ${item.isCompleted ? 'bg-blue-500 border-blue-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-blue-400'}`}>
                                    {item.isCompleted && <Check size={10} strokeWidth={3} className="text-white" />}
                                </div>
                                <span className={`text-[11px] leading-tight ${item.isCompleted ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-slate-300'} transition-all duration-200 break-words`}>
                                    {item.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 border border-slate-600 cursor-help hover:bg-slate-600 transition-colors">
                            <User size={12} />
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-slate-200 text-xs rounded border border-slate-700 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {teamName}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-700"></div>
                        </div>
                    </div>

                </div>
                <div className="flex flex-col items-end gap-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {request.date}
                    </div>
                    {request.deadline && (
                        <div className="flex items-center gap-1 text-amber-500/80" title="Deadline">
                            <AlertTriangle size={10} />
                            {request.deadline}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Kanban({ viewParams, setView }) {
    const { requests, equipment, updateRequestStage, getEquipmentName, getTeamName, removeRequest, toggleChecklistItem } = useData();
    const [filterEq, setFilterEq] = useState(viewParams?.equipmentId || null);
    const [filterPriority, setFilterPriority] = useState(viewParams?.priority || null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Delete Confirmation State
    const [deleteConfirm, setDeleteConfirm] = useState({
        isOpen: false,
        requestId: null
    });

    // Popup state
    const [activeMenu, setActiveMenu] = useState(null);

    const filteredRequests = useMemo(() => {
        let res = requests;
        if (filterEq) {
            res = res.filter(r => r.equipmentId === filterEq);
        }
        if (filterPriority) {
            res = res.filter(r => r.priority === filterPriority);
        }
        return res;
    }, [requests, filterEq, filterPriority]);

    const onDragStart = (e, id) => {
        e.dataTransfer.setData('requestId', id);
    };

    const onDrop = (e, stage) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('requestId');
        if (id) {
            updateRequestStage(id, stage);
        }
    };

    const onDragOver = (e) => {
        e.preventDefault();
    };

    const confirmDelete = () => {
        if (deleteConfirm.requestId) {
            removeRequest(deleteConfirm.requestId);
            setDeleteConfirm({ isOpen: false, requestId: null });
        }
    };

    const promptDelete = (id) => {
        setDeleteConfirm({
            isOpen: true,
            requestId: id
        });
        setActiveMenu(null);
    };

    const filterName = filterEq ? getEquipmentName(filterEq) : null;

    // Handle clicking outside to close menu
    React.useEffect(() => {
        const handleClickOutside = () => setActiveMenu(null);
        if (activeMenu) document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeMenu]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold mb-1">Maintenance Board</h2>
                        <p className="text-slate-400">Manage request lifecycle.</p>
                    </div>
                    {filterName && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 animate-in fade-in slide-in-from-left-4">
                            <span className="text-sm">Filtering: <b>{filterName}</b></span>
                            <button onClick={() => setFilterEq(null)} className="hover:text-white"><X size={14} /></button>
                        </div>
                    )}
                    {filterPriority && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 text-red-300 rounded-full border border-red-500/30 animate-in fade-in slide-in-from-left-4">
                            <span className="text-sm">Priority: <b>{filterPriority}</b></span>
                            <button onClick={() => setFilterPriority(null)} className="hover:text-white"><X size={14} /></button>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="glass-button px-4 py-2 rounded-lg text-sm"
                >
                    + Add Task
                </button>
            </div>

            <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                {['New', 'In Progress', 'Repaired', 'Scrap'].map(stage => (
                    <Column
                        key={stage}
                        title={stage}
                        stage={stage}
                        count={filteredRequests.filter(r => r.stage === stage).length}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                    >
                        {filteredRequests
                            .filter(r => r.stage === stage)
                            .map(req => {
                                const eqItem = equipment.find(e => e.id === req.equipmentId);
                                return (
                                    <Card
                                        key={req.id}
                                        request={req}
                                        equipmentName={getEquipmentName(req.equipmentId)}
                                        teamName={getTeamName(req.teamId)}
                                        category={eqItem?.category}
                                        company={req.company || eqItem?.company}
                                        onDragStart={onDragStart}
                                        onMenuClick={(e) => {
                                            e.stopPropagation();
                                            setActiveMenu(activeMenu === req.id ? null : req.id);
                                        }}
                                        showMenu={activeMenu === req.id}
                                        onDelete={() => promptDelete(req.id)}
                                        onToggleChecklist={(idx) => toggleChecklistItem(req.id, idx)}
                                    />
                                );
                            })}
                        {filteredRequests.filter(r => r.stage === stage).length === 0 && (
                            <div className="h-24 border-2 border-dashed border-slate-800 rounded-lg flex items-center justify-center text-slate-600 text-xs">
                                Drop items here
                            </div>
                        )}
                    </Column>
                ))}
            </div>

            <CreateRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <ConfirmationModal
                isOpen={deleteConfirm.isOpen}
                onClose={() => setDeleteConfirm({ ...deleteConfirm, isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Request?"
                message="Are you sure you want to delete this maintenance request? This action cannot be undone."
                confirmText="Delete"
                isDestructive={true}
            />
        </div>
    );
}

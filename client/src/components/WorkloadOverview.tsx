import React, { useEffect, useState } from 'react';
import { TechnicianWorkload } from '../types';
import { requestService } from '../services/requestService';
import { Users, Activity, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import Spinner from './Spinner';

const WorkloadOverview: React.FC = () => {
  const [workloads, setWorkloads] = useState<TechnicianWorkload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkloads();
  }, []);

  const loadWorkloads = async () => {
    try {
      const data = await requestService.getWorkload();
      setWorkloads(data);
    } catch (error) {
      console.error('Failed to load workloads', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (count: number) => {
    if (count <= 2) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/50";
    if (count <= 5) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800/50";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50";
  };

  const getStatusText = (count: number) => {
    if (count <= 2) return "Available";
    if (count <= 5) return "Busy";
    return "Overloaded";
  };

  const getStatusIcon = (count: number) => {
    if (count <= 2) return <CheckCircle2 className="w-4 h-4 mr-1" />;
    if (count <= 5) return <Clock className="w-4 h-4 mr-1" />;
    return <AlertCircle className="w-4 h-4 mr-1" />;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">Technician Workload</h3>
        </div>
        <div className="flex items-center text-sm font-semibold text-slate-500 dark:text-slate-400">
          <Users className="w-4 h-4 mr-1.5" />
          {workloads.length} Active Techs
        </div>
      </div>
      
      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {workloads.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400">
            No active workload data available.
          </div>
        ) : (
          workloads.map((tech) => (
            <div key={tech.technicianId} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {tech.technicianAvatar ? (
                  <img src={tech.technicianAvatar} alt={tech.technicianName} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                    {tech.technicianName.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{tech.technicianName}</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{tech.technicianEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-xl font-black text-slate-800 dark:text-slate-100">{tech.openTicketsCount}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tickets</div>
                </div>
                
                {tech.highPriorityCount > 0 && (
                  <div className="flex items-center justify-center bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30 px-2 py-1 rounded-md text-xs font-bold" title={`${tech.highPriorityCount} High Priority`}>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {tech.highPriorityCount}
                  </div>
                )}
                
                <div className={clsx("flex items-center px-2.5 py-1 rounded-md border text-xs font-bold w-28 justify-center", getBadgeStyle(tech.openTicketsCount))}>
                  {getStatusIcon(tech.openTicketsCount)}
                  {getStatusText(tech.openTicketsCount)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkloadOverview;

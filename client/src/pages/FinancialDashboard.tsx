import React, { useEffect, useState } from 'react';
import { equipmentService } from '../services/equipmentService';
import { EquipmentFinancials } from '../types';
import Spinner from '../components/Spinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { TrendingDown, AlertTriangle, DollarSign, Activity } from 'lucide-react';

const FinancialDashboard = () => {
  const [financials, setFinancials] = useState<EquipmentFinancials[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFinancials();
  }, []);

  const loadFinancials = async () => {
    try {
      const data = await equipmentService.getFinancials();
      setFinancials(data);
    } catch (error) {
      console.error('Failed to load financials:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner size="lg" label="Loading financial data..." centered />;
  }

  const totalAssetsValue = financials.reduce((sum, item) => sum + item.depreciatedValue, 0);
  const totalMaintenanceSpend = financials.reduce((sum, item) => sum + item.maintenanceCosts.total, 0);
  const moneyPitsCount = financials.filter(f => f.isMoneyPit).length;

  // Prepare data for the scatter chart: Depreciated Value vs Cumulative Maintenance
  const scatterData = financials.map(f => ({
    name: f.name,
    depreciatedValue: Math.round(f.depreciatedValue),
    maintenanceSpend: Math.round(f.maintenanceCosts.total),
    isMoneyPit: f.isMoneyPit
  }));

  const moneyPits = financials.filter(f => f.isMoneyPit).sort((a, b) => b.maintenanceCosts.total - a.maintenanceCosts.total);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Asset Depreciation & Financial Health</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track total cost of ownership and identify underperforming assets.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Depreciated Value</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${totalAssetsValue.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
              <TrendingDown className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Maintenance Spend</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">${totalMaintenanceSpend.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Money Pits Identified</p>
              <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">{moneyPitsCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Depreciated Value vs Maintenance Spend</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Items in the red zone are costing more to repair than they are worth.</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" dataKey="depreciatedValue" name="Current Value" unit="$" stroke="#8884d8" />
              <YAxis type="number" dataKey="maintenanceSpend" name="Maintenance Spend" unit="$" stroke="#82ca9d" />
              <ZAxis type="category" dataKey="name" name="Equipment" />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', backgroundColor: '#1f2937', color: '#fff' }} />
              <Legend />
              <Scatter name="Healthy Assets" data={scatterData.filter(d => !d.isMoneyPit)} fill="#10b981" />
              <Scatter name="Money Pits" data={scatterData.filter(d => d.isMoneyPit)} fill="#ef4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Money Pits Table */}
      {moneyPits.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-rose-600 dark:text-rose-400 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Money Pit Alerts
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              These assets have cumulative maintenance costs exceeding 75% of their current depreciated value.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Value</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Maint. Cost</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost / Value %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {moneyPits.map((item) => {
                  const percent = item.depreciatedValue > 0 ? ((item.maintenanceCosts.total / item.depreciatedValue) * 100).toFixed(1) : 'N/A';
                  return (
                    <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {item.name}
                        {item.serialNumber && <span className="block text-xs text-gray-500 font-normal">{item.serialNumber}</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">${item.depreciatedValue.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                      <td className="px-6 py-4 text-sm text-rose-600 dark:text-rose-400 font-semibold">${item.maintenanceCosts.total.toLocaleString(undefined, {maximumFractionDigits: 2})}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                          {percent}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialDashboard;

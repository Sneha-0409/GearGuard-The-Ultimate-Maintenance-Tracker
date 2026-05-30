import React, { createContext, useContext, useState, useMemo } from 'react';
import { EQUIPMENT, REQUESTS, TEAMS } from '../data/mockData';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
    const [equipment, setEquipment] = useState(EQUIPMENT);
    const [requests, setRequests] = useState(REQUESTS);
    const [teams] = useState(TEAMS);

    const getEquipmentName = (id) => equipment.find(e => e.id === id)?.name || 'Unknown';
    const getTeamName = (id) => teams.find(t => t.id === id)?.name || 'Unknown';

    const addRequest = (newRequest) => {
        setRequests(prev => [...prev, { ...newRequest, id: `r${Date.now()}`, stage: 'New' }]);
    };

    const updateRequestStage = (requestId, newStage) => {
        setRequests(prev => prev.map(r => {
            if (r.id === requestId) {
                // If moved to scrap, update the equipment status
                if (newStage === 'Scrap') {
                    updateEquipmentStatus(r.equipmentId, 'Scrap');
                }
                return { ...r, stage: newStage };
            }
            return r;
        }));
    };

    const toggleChecklistItem = (requestId, itemIndex) => {
        setRequests(prev => prev.map(r => {
            if (r.id === requestId) {
                const updatedChecklist = [...(r.checklist || [])];
                updatedChecklist[itemIndex] = {
                    ...updatedChecklist[itemIndex],
                    isCompleted: !updatedChecklist[itemIndex].isCompleted
                };
                return { ...r, checklist: updatedChecklist };
            }
            return r;
        }));
    };

    const updateEquipmentStatus = (equipId, status) => {
        setEquipment(prev => prev.map(e => e.id === equipId ? { ...e, status } : e));
    };

    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    const toggleTheme = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    React.useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const addEquipment = (newEquipment) => {
        setEquipment(prev => [...prev, { ...newEquipment, id: `e${Date.now()}` }]);
    };

    const removeEquipment = (id) => {
        setEquipment(prev => prev.filter(e => e.id !== id));
    };

    const removeRequest = (id) => {
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    const value = useMemo(() => ({
        equipment,
        requests,
        teams,
        getEquipmentName,
        getTeamName,
        addRequest,
        addEquipment,
        removeEquipment,
        removeRequest,
        updateRequestStage,
        toggleChecklistItem,
        theme,
        toggleTheme
    }), [equipment, requests, teams, theme]);

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

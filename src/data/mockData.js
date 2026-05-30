import dellServerImg from '../assets/dell-server.png';
import forkliftImg from '../assets/forklift.png';
import cncMachineImg from '../assets/cnc-machine.png';
import officeAcUnitImg from '../assets/office-ac-unit.png';

export const TEAMS = [
    { id: 't1', name: 'Mechanics', color: 'blue' },
    { id: 't2', name: 'IT Support', color: 'purple' },
    { id: 't3', name: 'Electricians', color: 'amber' },
    { id: 't4', name: 'Facility', color: 'emerald' },
];

export const EQUIPMENT = [
    {
        id: 'e1',
        name: 'CNC Machine 01',
        serial: 'CNC-2023-X1',
        department: 'Production',
        teamId: 't1', // Mechanics
        location: 'Floor 1, Sector A',
        status: 'Active',
        image: cncMachineImg,
        purchaseDate: '2023-01-15',
        warranty: '2026-01-15',
        employee: 'John Doe',
        technician: 'Mike R.',
        category: 'Heavy Machinery',
        company: 'GearGuard Inc.',
    },
    {
        id: 'e2',
        name: 'Dell Server Rack',
        serial: 'SRV-DL-99',
        department: 'IT',
        teamId: 't2', // IT
        location: 'Server Room B',
        status: 'Active',
        image: dellServerImg,
        purchaseDate: '2022-11-05',
        warranty: '2025-11-05',
        employee: 'Jane Smith',
        technician: 'Sarah J.',
        category: 'Computers',
        company: 'GearGuard Inc.',
    },
    {
        id: 'e3',
        name: 'Hydraulic Press',
        serial: 'HP-5000-Z',
        department: 'Heavy Ops',
        teamId: 't1', // Mechanics
        location: 'Floor 2, Bay 4',
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600',
        purchaseDate: '2020-05-20',
        warranty: 'Expired',
        employee: 'Bob Wilson',
        technician: 'Alex M.',
        category: 'Heavy Machinery',
        company: 'GearGuard Inc.',
    },
    {
        id: 'e4',
        name: 'Office AC Unit',
        serial: 'AC-HVAC-04',
        department: 'Admin',
        teamId: 't4', // Facility
        location: 'Roof',
        status: 'Active',
        image: officeAcUnitImg,
        purchaseDate: '2019-03-10',
        warranty: 'Expired',
        employee: 'Alice Brown',
        technician: 'Sam K.',
        category: 'HVAC',
        company: 'GearGuard Inc.',
    },
    {
        id: 'e5',
        name: 'Forklift 3000',
        serial: 'FL-CAT-30',
        department: 'Logistics',
        teamId: 't1',
        location: 'Warehouse',
        status: 'Active',
        image: forkliftImg,
        purchaseDate: '2024-06-01',
        warranty: '2029-06-01',
        employee: 'Charlie Day',
        technician: 'Unassigned',
        category: 'Vehicle',
        company: 'GearGuard Inc.',
    },
];

export const REQUESTS = [
    {
        id: 'r1',
        equipmentId: 'e3', // Hydraulic Press
        subject: 'Leaking Oil',
        type: 'Corrective',
        stage: 'New',
        teamId: 't1',
        date: '2025-12-28', // Scheduled
        duration: 0,
        priority: 'High',
        technician: 'Alex M.',
        deadline: '2025-12-30',
        company: 'GearGuard Inc.',
        hours: 0,
        checklist: [
            { text: 'Inspect O-rings', isCompleted: false },
            { text: 'Replace damaged seals', isCompleted: false },
            { text: 'Test for leaks under pressure', isCompleted: false }
        ]
    },
    {
        id: 'r2',
        equipmentId: 'e2', // Server Rack
        subject: 'Overheating Warning',
        type: 'Preventive',
        stage: 'In Progress',
        teamId: 't2',
        date: '2025-12-25', // Overdue
        duration: 0,
        priority: 'Critical',
        technician: 'Sarah J.',
        deadline: '2025-12-26',
        checklist: [
            { text: 'Check thermal paste', isCompleted: true },
            { text: 'Clean fans', isCompleted: false }
        ]
    },
    {
        id: 'r3',
        equipmentId: 'e1',
        subject: 'Routine Inspection',
        type: 'Preventive',
        stage: 'Repaired',
        teamId: 't1',
        date: '2025-12-20',
        duration: 2,
        priority: 'Medium',
        technician: 'Mike R.',
        deadline: '2025-12-22',
        checklist: [
            { text: 'Visual inspection', isCompleted: true },
            { text: 'Lubricate moving parts', isCompleted: true },
            { text: 'Log report', isCompleted: true }
        ]
    },
    {
        id: 'r4',
        equipmentId: 'e5',
        subject: 'Battery Replacement',
        type: 'Corrective',
        stage: 'New',
        teamId: 't1',
        date: '2025-12-29',
        duration: 0,
        priority: 'Medium',
        technician: 'Unassigned',
        deadline: '2026-01-02',
        checklist: []
    },
];

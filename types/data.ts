// data.ts
import { Request } from './types';

export const requests: Request[] = [
    {   
        id: '0',
        requesterUsername: 'John',
        appliance: 'Toaster',
        collateral: true,
        requestDuration: 60,
        status: 'Open',
        created: '12:00 am',
    },
    {
        id: '1',
        requesterUsername: 'User',
        appliance: 'microwave',
        collateral: false,
        requestDuration: 120,
        status: 'Open',
        created: '6:00 am',
    },
    {
        id: '2',
        requesterUsername: 'Bob',
        appliance: 'Air Fryer',
        collateral: false,
        requestDuration: 1000,
        status: 'Closed',
        created: '6:00 pm',
    }
];

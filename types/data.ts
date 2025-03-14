// data.ts
import { Request } from './types';
import { Appliance } from './types';

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



export const appliances: Appliance[] = [
    {
        id: '0',
        ownerUsername: "Frank22",
        Name: "Toaster",
        Description: "Working standard Toaster, anyone can borrow it if needed.",
        timeAvailable: 24,
        lendTo: 'Anyone',
        isVisible: true,
        created: "8:00 AM",       
    },
    {
        id: '1',
        ownerUsername: "John1",
        Name: "Mixer",
        Description: "Mixer is a little broken, sometimes you need to unplug and replug it. Can't mix super dense items, but besides that it works well",
        timeAvailable: 48,
        lendTo: 'Same Floor',
        isVisible: true,
        created: "11:36 AM",       
    }
];
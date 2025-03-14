export type Request = {
    id: string;
    requesterUsername: string;
    appliance: string;
    collateral: boolean;
    requestDuration: Number;
    status: 'Open' | 'Fulfilled' | 'Closed';
    created: string;
};

export type Appliance = {
    id: string; // String because request ID is also a string
    ownerUsername: string;
    Name: string;
    Description: string;
    timeAvailable: Number;
    lendTo: 'Same Floor' | 'Same Dorm' | 'Anyone'
    isVisible: boolean;
    created: string;
}
export type Request = {
    requesterEmail: string;
    applianceName: string;
    collateral: boolean;
    requestDuration: Number;
    status: 'open' | 'fulfilled' | 'closed';
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
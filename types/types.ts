export type Request = {
    requesterEmail: string;
    applianceName: string;
    collateral: boolean;
    requestDuration: Number;
    status: 'open' | 'fulfilled' | 'closed';
};

export type Appliance = {
    ownerUsername: string;
    name: string;
    description: string;
    timeAvailable: Number;
    lendTo: 'Same Floor' | 'Same Dorm' | 'Anyone'
    isVisible: boolean;
}
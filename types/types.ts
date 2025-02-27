export type Request = {
    id: string;
    requesterUsername: string;
    appliance: string;
    collateral: boolean;
    requestDuration: Number;
    status: 'Open' | 'Fulfilled' | 'Closed';
    created: string;
};

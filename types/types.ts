export type Request = {
    requesterEmail: string;
    applianceName: string;
    collateral: boolean;
    requestDuration: Number;
    status: 'open' | 'fulfilled' | 'closed';
};

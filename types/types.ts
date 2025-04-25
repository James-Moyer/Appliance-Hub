//----------Types for Views and Components----------//
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
};

export type UserType = {
    uid: string;
    username: string;
    email: string;
};

export type MessageType = {
    messageId?: string;
    senderUid: string;
    recipientUid: string;
    text: string;
    timestamp: number;
};

export type ApplianceProps = {
    data: Appliance[]; 
};

export type RequestProps = {
    data: Request[];
};

//----------Interfaces for Views and Components----------//
export interface UserData {
    username?: string;
    email?: string;
    emailVerified?: boolean;
    location?: string;
    floor?: number;
    showDorm?: boolean;
    showFloor?: boolean;
    [key: string]: any;
};

export interface PublicProfileViewProps {
    user: UserData;
    loading: boolean;
};

export interface ProfileViewProps {
    user: UserData;
    editing: boolean;
    editedUsername: string;
    editedLocation: string;
    editedFloor: string;
    setEditedUsername: React.Dispatch<React.SetStateAction<string>>;
    setEditedLocation: React.Dispatch<React.SetStateAction<string>>;
    setEditedFloor: React.Dispatch<React.SetStateAction<string>>;
    handleSave: () => void;
    handleEditToggle: () => void;
    handleSendVerificationEmail: () => void;
    handleDeleteAccount: () => void;
    logout: () => void;
};

export interface RequestBoardViewProps {
    filter: string;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    modalVisible: boolean;
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    newRequest: Request;
    setNewRequest: React.Dispatch<React.SetStateAction<Request>>;
    collateralPickerOpen: boolean;
    setCollateralPickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    durationPickerOpen: boolean;
    setDurationPickerOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleCreateRequest: () => void;
    getFilteredRequests: () => Request[];
};

export interface ChatScreenViewProps {
    cameFromRB: boolean;
    handleBackPress: () => void;
    allUsers: UserType[];
    selectUser: (user: UserType) => void;
    selectedUser: UserType | null;
    messages: MessageType[];
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: () => void;
};

export interface ApplianceBoardViewProps {
    appliances: Appliance[];
    filter: string;
    setFilter: React.Dispatch<React.SetStateAction<string>>;
    modalVisible: boolean;
    setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    newAppliance: Appliance;
    setNewAppliance: React.Dispatch<React.SetStateAction<Appliance>>;
    lendToDropdownOpen: boolean;
    setLendToDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
    visibilityDropdownOpen: boolean;
    setVisibilityDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleCreateAppliance: () => void;
};

export interface ChatUsersProps {
    allUsers: UserType[];
    selectUser: (user: UserType) => void;
};

export interface ConversationProps {
    messages: MessageType[];
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    sendMessage: () => void;
};
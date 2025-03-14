import { getAuth } from 'firebase/auth';

export const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
        try {
            const token = await user.getIdToken();
            return token;
        } catch (error) {
            console.error('Error fetching Firebase token:', error);
            return null;
        }
    } else {
        console.log('No user is logged in');
        return null;
    }
};
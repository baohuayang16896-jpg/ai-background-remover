const GOOGLE_CLIENT_ID = '35125519641-lubljhc670hl669qb4u70km61dklc42u.apps.googleusercontent.com';
const REDIRECT_URI = window.location.origin + '/auth/callback';
const API_BASE = '/api';

class Auth {
    constructor() {
        this.user = this.getStoredUser();
    }

    getStoredUser() {
        const userData = localStorage.getItem('user');
        return userData ? JSON.parse(userData) : null;
    }

    isLoggedIn() {
        return this.user !== null;
    }

    login() {
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            scope: 'profile email'
        });
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }

    logout() {
        localStorage.removeItem('user');
        this.user = null;
        window.location.reload();
    }

    getUser() {
        return this.user;
    }
}

const auth = new Auth();

// Google OAuth 配置
const GOOGLE_CLIENT_ID = '35125519641-lubljhc670hl669qb4u70km61dklc42u.apps.googleusercontent.com';
const REDIRECT_URI = 'https://bg-remover-9at.pages.dev/auth/callback';

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
            response_type: 'token',
            scope: 'profile email'
        });
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }

    async handleCallback() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');

        if (accessToken) {
            const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const userData = await response.json();
            
            this.user = {
                name: userData.name,
                email: userData.email,
                picture: userData.picture
            };
            
            localStorage.setItem('user', JSON.stringify(this.user));
            window.location.href = '/';
        }
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

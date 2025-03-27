import axios from 'axios';

const API_URL = 'http://localhost:3002/auth';

class AuthService {
    constructor() {
        this.setupInterceptors();
    }

    setupInterceptors() {
        axios.interceptors.request.use(
            config => {
                const user = this.getCurrentUser();
                if (user && user.accessToken) {
                    config.headers['Authorization'] = `Bearer ${user.accessToken}`;
                }
                return config;
            },
            error => Promise.reject(error)
        );

        axios.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;

                // Check if it's a token expiration error and not already retried
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const user = this.getCurrentUser();
                        if (user && user.refreshToken) {
                            // Attempt to refresh the token
                            const refreshResponse = await this.refreshToken(user.refreshToken);

                            // Update stored tokens
                            const updatedUser = {
                                ...user,
                                accessToken: refreshResponse.accessToken,
                                refreshToken: refreshResponse.refreshToken
                            };
                            localStorage.setItem('user', JSON.stringify(updatedUser));

                            // Retry the original request with new token
                            originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.accessToken}`;
                            return axios(originalRequest);
                        }
                    } catch (refreshError) {
                        // If refresh fails, force logout
                        this.logout();
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    async refreshToken(refreshToken) {
        try {
            const response = await axios.post(`${API_URL}/refresh-token`, { refreshToken });
            return response.data;
        } catch (error) {
            console.error('Token refresh failed', error);
            throw error;
        }
    }

    async login(username, password) {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                name: username,
                password
            });

            if (response.data.accessToken) {
                localStorage.setItem('user', JSON.stringify({
                    username: response.data.name,
                    accessToken: response.data.accessToken,
                    refreshToken: response.data.refreshToken
                }));

                return response.data;
            }
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem('user'));
    }

    getCurrentUsername() {
        const user = this.getCurrentUser();
        return user ? user.username : null;
    }

    isAuthenticated() {
        const user = this.getCurrentUser();
        return !!user && !!user.accessToken;
    }

    // Remove setupAuthHeader as it's not defined
    getAuthHeader() {
        const user = this.getCurrentUser();
        return user && user.accessToken
            ? { Authorization: `Bearer ${user.accessToken}` }
            : {};
    }
}

export default new AuthService();
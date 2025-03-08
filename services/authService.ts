import axios from 'axios';
import Router from 'next/router';
import { useAuth } from '@/context/AuthContext';

// Set up axios instance
const api = axios.create({
    baseURL: 'http://localhost:3000/api', // Update with your API base URL
});

// Token refresh in progress
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onTokenRefreshed(token: string) {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
    refreshSubscribers.push(callback);
}

// Safely get token from localStorage
function getToken(key: string) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error(`Failed to get ${key} from localStorage`, error);
        return null;
    }
}

// Store token in localStorage with error handling
function setToken(key: string, token: string) {
    try {
        localStorage.setItem(key, token);
    } catch (error) {
        console.error(`Failed to set ${key} in localStorage`, error);
    }
}

// Handle token refresh logic
async function refreshAccessToken() {
    const refreshToken = getToken('refreshToken');
    if (!refreshToken) {
        throw new Error('No refresh token available');
    }

    const response = await axios.post('http://localhost:3000/api/users/refresh', { refreshToken });
    if (!response.data.accessToken) {
        Router.push('/logout');
    }
    const newAccessToken = response.data.accessToken;

    setToken('accessToken', newAccessToken);

    api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
    onTokenRefreshed(newAccessToken);

    return newAccessToken;
}

// Add request interceptor to attach the access token
api.interceptors.request.use(
    (config) => {
        const accessToken = getToken('accessToken');
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                // If a refresh is already in progress, wait for it to complete
                return new Promise((resolve) => {
                    addRefreshSubscriber((token: string) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(api(originalRequest));
                    });
                });
            }

            isRefreshing = true;

            try {
                const newAccessToken = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (error) {
                // Failed to refresh, log out
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                Router.push('/logout');
                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;

export async function getValidAccessToken(): Promise<string | null> {
    let accessToken = getToken('accessToken');

    try {
        // Test if the current access token is valid by making a lightweight authenticated request
        if (accessToken) {
            await api.get('/auth/check-token', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            return accessToken;
        }
    } catch (error) {
        // If the request fails with a 401, the token is likely expired and needs refreshing
        if (axios.isAxiosError(error) && error.response?.status === 401) {
            try {
                // Refresh the access token
                accessToken = await refreshAccessToken();
                return accessToken;
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                // Log the user out if refresh fails
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                Router.push('/logout');
                return null;
            }
        }
    }

    return null;
}


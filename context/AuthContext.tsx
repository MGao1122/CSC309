// // context/AuthContext.tsx
// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import Router from 'next/router';

// type User = {
//     id: number;
//     username: string;
//     email: string;
//     firstName: string;
//     lastName: string;
//     avatar: string;
//     phone?: string;
//     role: string;
// };

// type AuthContextType = {
//     user: User | null;
//     setUser: (user: User | null) => void;
//     logout: () => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//     const [user, setUser] = useState<User | null>(null);

//     useEffect(() => {
//         const userData = localStorage.getItem('user');
//         if (userData) {
//             setUser(JSON.parse(userData));
//         }
//     }, []);

//     const logout = () => {
//         localStorage.removeItem('accessToken');
//         localStorage.removeItem('refreshToken');
//         localStorage.removeItem('user');
//         setUser(null);
//         Router.push('/');
//     };

//     return (
//         <AuthContext.Provider value={{ user, setUser, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => {
//     const context = useContext(AuthContext);
//     if (!context) {
//         throw new Error('useAuth must be used within an AuthProvider');
//     }
//     return context;
// };

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Router from 'next/router';

type User = {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
    phone?: string;
    role: string;
};

type AuthContextType = {
    user: User | null;
    setUser: (user: User | null) => void;
    logout: () => void;
    loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const userData = localStorage.getItem('user');
            if (userData) {
                const parsedUser = JSON.parse(userData);
                setUser(parsedUser);
            }
        } catch (error) {
            console.error('Failed to load user from localStorage', error);
            // Clear potentially corrupted data
            localStorage.removeItem('user');
        } finally {
            setLoading(false); // Set loading to false after user data is processed
        }
    }, []);

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setUser(null);
        Router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout, loading }}>
            {loading ? <p>Loading...</p> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
import React, { createContext, useContext, useState } from 'react';

interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    avatar: string;
    email: string;
}

const UserContext = createContext<{
    users: { [key: number]: User };
    addUser: (id: number, userInfo: User) => void;
    getUser: (id: number) => User | undefined;
}>({
    users: {},
    addUser: () => { },
    getUser: () => undefined,
});

import { ReactNode } from 'react';

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<{ [key: number]: User }>({});

    const getUser = (id: number) => users[id];
    const addUser = (id: number, userInfo: User) => {
        setUsers((prev: { [key: number]: User }) => ({ ...prev, [id]: userInfo }));
    };

    return (
        <UserContext.Provider value={{ users, addUser, getUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUserContext = () => useContext(UserContext);

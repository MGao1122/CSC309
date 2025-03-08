import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUserContext } from '@/context/UserContext';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hovercard"


interface UserProps {
    id: number;
}

interface User {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    // Add other user properties as needed
}

const User: React.FC<UserProps> = ({ id }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { getUser, addUser } = useUserContext();

    useEffect(() => {
        const cachedUser = getUser(id);
        if (cachedUser) {
            console.log('User found in cache:', cachedUser);
            setUser(cachedUser);
            setLoading(false);
            return;
        }
        console.log(cachedUser);


        const fetchUser = async () => {
            try {
                const response = await axios.get(`/api/find/user/${id}`);
                setUser(response.data);
                addUser(id, response.data);
            } catch (err) {
                setError('Error fetching user data');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const avatarSrc = user?.avatar
        ? `data:image/png;base64,${user.avatar}`
        : '/default-avatar.png';

    return (
        <HoverCard openDelay={10} closeDelay={100}>
            <HoverCardTrigger>
                {user ? (
                    <div className="flex items-center gap-2">
                        <img
                            src={avatarSrc}
                            alt="User Avatar"
                            className="rounded-full cursor-pointer w-10 h-10 object-cover border-2 border-gray-300 dark:border-gray-700 hover:border-blue-500 transition-colors duration-300"
                        />
                        <h4 className='font-bold'>
                            <span className='text-blue-500 dark:text-blue-300 font-medium mr-2 cursor-pointer bg-gray-300 dark:bg-gray-800 rounded-md py-1 px-2'
                        >{user.username}</span>{user.firstName} {user.lastName}</h4>
                    </div>
                ) : (
                    <div>User not found</div>
                )}
            </HoverCardTrigger>
        </HoverCard>
    );

};

export default User;
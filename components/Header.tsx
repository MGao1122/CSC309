// components/Header.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface User {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    role: string;
}

const Header: React.FC = () => {
    const { user, logout }: { user: User | null; logout: () => void } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const avatarSrc = useMemo(
        () => (user?.avatar ? `data:image/png;base64,${user.avatar}` : '/default-avatar.png'),
        [user?.avatar]
    );

    const toggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    const closeDropdown = () => {
        setDropdownOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                closeDropdown();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const isActive = (route: string) => router.pathname === route;

    return (
        // add shadow-md to header
        <header className="flex items-center justify-between p-4 bg-background/50 transition-colors duration-300 relative shadow-md">
            <Link href={"/"}>
                <div className="flex items-center space-x-4 ">
                    <Image
                        src="/logoNoBG.png"
                        alt="Logo"
                        width={40}
                        height={40}
                        className="cursor-pointer object-cover rounded-full"
                    />
                    <h1 className="text-2xl font-semibold text-foreground">Our App</h1>
                </div>
            </Link>

            <div className="flex items-center space-x-4">
                <Link href="/code" passHref>
                    <span
                        className={`text-sm font-medium ${isActive('/code') ? 'text-gray-500' : 'text-foreground'
                            } hover:text-gray-500 mr-4`}
                    >
                        Code Editor
                    </span>
                </Link>

                {user ? (
                    <div className="relative" ref={dropdownRef}>
                        <Image
                            src={avatarSrc}
                            alt="User Avatar"
                            width={40}
                            height={40}
                            className="rounded-full cursor-pointer border-2 border-gray-300 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-200 transition-colors duration-300"
                            onClick={toggleDropdown}
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                            layout='fixed'
                            style={{
                                maxWidth: '40px',
                                maxHeight: '40px',
                                objectFit: 'contain', // Or 'cover' depending on your preference
                                objectPosition: 'center', // Ensures the image stays centered
                            }}
                        />
                        {/* Dropdown menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10">
                                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                    <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
                                    <p className="text-sm text-foreground overflow-hidden">{user.email}</p>
                                </div>
                                <Link href="/user/personal_page" passHref>
                                    <span
                                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={closeDropdown}
                                    >
                                        Your Posts
                                    </span>
                                </Link>
                                <Link href="/user/profile" passHref>
                                    <span
                                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={closeDropdown}
                                    >
                                        Manage Profile
                                    </span>
                                </Link>
                                {user.role === 'admin' && (
                                    <Link href="/admin" passHref>
                                        <span
                                            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                            onClick={closeDropdown}
                                        >
                                            Admin Panel
                                        </span>
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        logout();
                                        closeDropdown();
                                    }}
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    // If not logged in, show Sign Up and Log In buttons
                    <div className="flex space-x-4">
                        <Link href="/signup" passHref>
                            <span className="text-sm font-medium text-foreground hover:text-gray-500 dark:hover:text-gray-500">Sign Up</span>
                        </Link>
                        <Link href="/login" passHref>
                            <span className="text-sm font-medium text-foreground hover:text-gray-500 dark:hover:text-gray-500">Log In</span>
                        </Link>
                    </div>
                )}

                <ThemeToggle />
            </div>
        </header>
    );
};

export default Header;

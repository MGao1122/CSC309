import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

interface User {
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    role: string;
}

const MobileHeader: React.FC = () => {
    const { user, logout }: { user: User | null; logout: () => void } = useAuth();
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleMenu = (): void => {
        setMenuOpen((prev) => !prev);
    };

    const closeMenu = (): void => {
        setMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent): void => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                closeMenu();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="flex items-center justify-between p-4 bg-background text-foreground">
            {/* Logo */}
            <Link href="/" passHref>
                <div className="flex items-center space-x-4 cursor-pointer">
                    <img
                        src="/logoNoBG.png"
                        alt="Logo"
                        className="object-cover w-8 h-8 rounded-full"
                    />
                    <h1 className="text-lg font-semibold">Our App</h1>
                </div>
            </Link>

            {/* Hamburger Menu */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={toggleMenu}
                    className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Menu"
                    aria-expanded={menuOpen}
                >
                    <svg
                        className="w-6 h-6 text-foreground"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-900 rounded-md shadow-lg z-10">
                        {/* Profile Section */}
                        {user ? (
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
                                <img
                                    src={
                                        user.avatar
                                            ? `data:image/png;base64,${user.avatar}`
                                            : '/default-avatar.png'
                                    }
                                    alt="User Avatar"
                                    className="w-12 h-12 rounded-full mr-4 object-cover"
                                    style={{
                                        maxWidth: '40px',
                                        maxHeight: '40px',
                                        objectFit: 'contain', // Or 'cover' depending on your preference
                                        objectPosition: 'center', // Ensures the image stays centered
                                    }}
                                />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        {user.firstName} {user.lastName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {user.email}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="p-4 text-gray-600 dark:text-gray-400">
                                Not logged in
                            </p>
                        )}

                        {/* Dropdown Links */}
                        <div className="py-2">
                            <Link href="/code" passHref>
                                <span
                                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                    onClick={closeMenu}
                                >
                                    Code Editor
                                </span>
                            </Link>
                            {user && (
                                <>
                                    <Link href="/user/personal_page" passHref>
                                        <span
                                            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                            onClick={closeMenu}
                                        >
                                            Your Posts
                                        </span>
                                    </Link>
                                    <Link href="/user/profile" passHref>
                                        <span
                                            className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                            onClick={closeMenu}
                                        >
                                            Manage Profile
                                        </span>
                                    </Link>
                                </>
                            )}
                            {user?.role === 'admin' && (
                                <Link href="/admin" passHref>
                                    <span
                                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={closeMenu}
                                    >
                                        Admin Panel
                                    </span>
                                </Link>
                            )}
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700"></div>

                        {/* Theme Toggle */}
                        <div className="p-4">
                            <ThemeToggle />
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700"></div>

                        {/* Logout */}
                        {user && (
                            <button
                                onClick={() => {
                                    logout();
                                    closeMenu();
                                }}
                                className="w-full text-left px-4 py-4 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Logout
                            </button>
                        )}

                        {!user && (
                            <div className="py-2">
                                <Link href="/login" passHref>
                                    <span
                                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={closeMenu}
                                    >
                                        Log In
                                    </span>
                                </Link>
                                <Link href="/signup" passHref>
                                    <span
                                        className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={closeMenu}
                                    >
                                        Sign Up
                                    </span>
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default MobileHeader;

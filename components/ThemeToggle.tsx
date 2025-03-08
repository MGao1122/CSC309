import { useState, useEffect } from "react";

const ThemeToggle: React.FC = () => {
    const [isDark, setIsDark] = useState(false);

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle("dark", !isDark);
        localStorage.setItem("theme", !isDark ? "dark" : "light");
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme === "dark") {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        }
    }, []);

    return (
        <label
            htmlFor="theme-toggle"
            className="relative inline-flex items-center cursor-pointer"
        >
            <input
                type="checkbox"
                id="theme-toggle"
                className="sr-only"
                checked={isDark}
                onChange={toggleTheme}
            />

            <div className="w-14 h-8 bg-gray-200/50 dark:bg-gray-800/50 rounded-full p-1 flex items-center justify-between transition-colors duration-300 relative">
                <img
                    src="/moon.svg"
                    alt="Sun Icon"
                    className={`w-5 h-4 absolute left-1.5 transform transition-opacity duration-300 ${isDark ? "opacity-100" : "opacity-0"
                        }`}
                />

                <img
                    src="/sun.svg"
                    alt="Moon Icon"
                    className={`w-5 h-5 absolute right-1.5 transform transition-opacity duration-300 ${isDark ? "opacity-0" : "opacity-100"
                        }`}
                />

                <span
                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isDark ? "translate-x-6" : "translate-x-0"
                        }`}
                ></span>
            </div>
        </label>
    );
};

export default ThemeToggle;

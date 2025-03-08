import React, { ReactNode } from "react";

interface FrostedGlassProps {
    className?: string; // Allow additional styling via className
    children?: ReactNode; // Support child elements
}

const FrostedGlass: React.FC<FrostedGlassProps> = ({ className, children }) => {
    return (
        <div
            className={`bg-white/30 dark:bg-black/30 border border-gray-800/30 dark:border-gray-400/30 rounded-xl shadow-lg p-6 ${className || ""}`}
        >
            {children}
        </div>
    );
};

export default FrostedGlass;

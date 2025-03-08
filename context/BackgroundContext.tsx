import { createContext, useContext, useState, ReactNode } from "react";

interface BackgroundContextProps {
  height: string; // Height of the background
  setHeight: (newHeight: string) => void; // Function to update height
}

// Create the context
const BackgroundContext = createContext<BackgroundContextProps | undefined>(undefined);

// Context provider component
export const BackgroundProvider = ({ children }: { children: ReactNode }) => {
  const [height, setHeight] = useState("100vh"); // Default to full viewport height

  return (
    <BackgroundContext.Provider value={{ height, setHeight }}>
      {children}
    </BackgroundContext.Provider>
  );
};

// Hook to use the context
export const useBackground = () => {
  const context = useContext(BackgroundContext);
  if (!context) {
    throw new Error("useBackground must be used within a BackgroundProvider");
  }
  return context;
};

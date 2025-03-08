import React, { useEffect } from "react";
import { useBackground } from "@/context/BackgroundContext";

interface BackgroundManagerProps {
  children: React.ReactNode;
}

const BackgroundManager: React.FC<BackgroundManagerProps> = ({ children }) => {
  const { setHeight } = useBackground();

  useEffect(() => {
    const updateHeight = () => {
      const newHeight = `${document.documentElement.offsetHeight}px`;
      setHeight(newHeight);
      console.log("Updated height:", newHeight);
    };

    // Initial height calculation
    updateHeight();

    // Observe changes to the DOM
    const observer = new MutationObserver(() => {
      updateHeight(); // Update height whenever the DOM changes
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Add window resize listener
    const handleResize = () => {
      updateHeight(); // Update height on window resize
    };
    window.addEventListener("resize", handleResize);

    // Cleanup observer and event listener on component unmount
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [setHeight]);

  return <>{children}</>;
};

export default BackgroundManager;

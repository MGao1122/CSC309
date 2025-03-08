import React, { useEffect, ReactNode } from "react";
import gsap from "gsap";
import { useBackground } from "@/context/BackgroundContext";

// Define the component with props
interface StaticBlobsProps {
    className?: string; // Optional className prop
    children?: ReactNode; // Optional children prop
}

const Background: React.FC<StaticBlobsProps> = ({ className, children }) => {
    const { height } = useBackground(); // Get the height from the context

    useEffect(() => {
        const colorPalettes = [
            ["rgba(108, 0, 162, 0.7)", "rgba(0, 17, 82, 0.7)", "rgba(221, 74, 255, 0.7)", "rgba(18, 113, 255, 0.7)"],
            ["rgba(255, 99, 71, 0.7)", "rgba(70, 130, 180, 0.7)", "rgba(255, 215, 0, 0.7)", "rgba(152, 251, 152, 0.7)"],
            ["rgba(138, 43, 226, 0.7)", "rgba(255, 20, 147, 0.7)", "rgba(64, 224, 208, 0.7)", "rgba(255, 165, 0, 0.7)"],
            ["rgba(0, 255, 127, 0.7)", "rgba(173, 216, 230, 0.7)", "rgba(255, 0, 255, 0.7)", "rgba(255, 105, 180, 0.7)"],
        ];

        let index = 0;

        const updateColors = () => {
            const [blob1, blob2, blob3, blob4] = colorPalettes[index];
            gsap.to(":root", {
                "--blob1-color": blob1,
                "--blob2-color": blob2,
                "--blob3-color": blob3,
                "--blob4-color": blob4,
                duration: 10, // Transition duration in seconds
            });

            // Animate the positions of the blobs
            gsap.to(":root", {
                "--blob1-position": `${Math.random() * 100}% ${Math.random() * 100}%`,
                "--blob2-position": `${Math.random() * 100}% ${Math.random() * 100}%`,
                "--blob3-position": `${Math.random() * 100}% ${Math.random() * 100}%`,
                "--blob4-position": `${Math.random() * 100}% ${Math.random() * 100}%`,
                duration: 10,
                ease: "sine.inOut",
            });

            index = (index + 1) % colorPalettes.length; // Loop through the palettes
        };

        // Trigger the first update and set up an interval for periodic updates
        updateColors();
        const interval = setInterval(updateColors, 10000); // Change colors every 10 seconds

        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    return (
        <div
            className={`absolute h-auto w-full -z-10 background-fade-in ${className || ""}`}
            style={{
                height,
                backgroundImage: `
          radial-gradient(circle at var(--blob1-position, 30% 30%), var(--blob1-color, rgba(108, 0, 162, 0.7)), transparent 60%),
          radial-gradient(circle at var(--blob2-position, 70% 70%), var(--blob2-color, rgba(0, 17, 82, 0.7)), transparent 60%),
          radial-gradient(circle at var(--blob3-position, 50% 50%), var(--blob3-color, rgba(221, 74, 255, 0.7)), transparent 60%),
          radial-gradient(circle at var(--blob4-position, 80% 20%), var(--blob4-color, rgba(18, 113, 255, 0.7)), transparent 60%)
        `,
            }}
        >
            <div className="absolute h-full w-full bg-white/30 dark:bg-black/50" />
            {children}
        </div>
    );
};

export default Background;

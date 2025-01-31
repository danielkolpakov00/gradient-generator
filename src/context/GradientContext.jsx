import { createContext, useContext, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";

// Create Gradient Context
export const GradientContext = createContext(null);

export const useGradient = () => {
  const context = useContext(GradientContext);
  if (!context) {
    throw new Error("useGradient must be used within a GradientProvider");
  }
  return context;
};

// GradientProvider - Manages gradient state and provides context
export function GradientProvider({ children }) {
  const [gradType, setGradType] = useState(0); // 0 = linear, 1 = radial
  const [blendMode, setBlendMode] = useState(50); // Controls blending style
  const [gradDepth, setGradDepth] = useState(50); // Brightness control
  const [gradIntensity, setGradIntensity] = useState(50); // Distortion control
  const [gradComplexity, setGradComplexity] = useState(50); // Noise detail
  const [gradRotation, setGradRotation] = useState(0); // Rotation angle
  const [gradScale, setGradScale] = useState(100); // Scale of gradients
  const [gradMouseEvents, setGradMouseEvents] = useState(false); // Mouse effect
  const [animGrad, setAnimGrad] = useState(true); // Animate gradients
  const [gradInvert, setGradInvert] = useState(false); // Invert colors
  const [gradient, setGradient] = useState(""); // Current gradient CSS
  const [currentMessage, setCurrentMessage] = useState('');

  // Generate random colors
  const generateRandomColor = useCallback(() => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
  }, []);

  // Generate gradient background
  const generateGradient = useCallback(() => {
    const colors = Array.from({ length: Math.floor(gradDepth / 10) + 3 }, generateRandomColor).join(", ");
    return gradType === 0
      ? `linear-gradient(${gradRotation}deg, ${colors})`
      : `radial-gradient(circle, ${colors})`;
  }, [gradType, gradRotation, gradDepth, generateRandomColor]);

  // Update gradient on state change
  useEffect(() => {
    setGradient(generateGradient());
  }, [gradType, gradRotation, gradDepth, generateGradient]);

  // Animate gradient if enabled
  useEffect(() => {
    if (animGrad) {
      const interval = setInterval(() => {
        setGradient(generateGradient());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [animGrad, generateGradient]);

  const randomizeGradient = () => {
    setGradType(Math.random() > 0.5 ? 0 : 1);
    setGradDepth(Math.random() * 100);
    setGradIntensity(Math.random() * 100);
    setGradComplexity(Math.random() * 100);
    setGradRotation(Math.random() * 360);
    setGradScale(Math.random() * 200);
  };

  const triggerNewMessage = useCallback(() => {
    const messages = [
      "Sick colours dude!",
      "Yooooo!",
      "Keep experimenting!",
      "Try tweaking the complexity!",
      "Sweet colors!",
      "Sweet gradient!",
      "Not too shabby!",
      "Pixel perfect!",
      "That's trippy!",
      "This is the one."
    ];
    setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, []); // using addcallback to prevent infinite loop

  const value = {
    gradType,
    setGradType,
    blendMode,
    setBlendMode,
    gradDepth,
    setGradDepth,
    gradIntensity,
    setGradIntensity,
    gradComplexity,
    setGradComplexity,
    gradRotation,
    setGradRotation,
    gradScale,
    setGradScale,
    gradMouseEvents,
    setGradMouseEvents,
    gradInvert,
    setGradInvert,
    animGrad,
    setAnimGrad,
    randomizeGradient,
    gradient,
    currentMessage,
    triggerNewMessage, // Make sure this is included
  };

  return (
    <GradientContext.Provider value={value}>
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: gradient,
          transition: animGrad ? "background 2s ease-in-out" : "none",
          filter: gradInvert ? "invert(1)" : "none",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </GradientContext.Provider>
  );
}

GradientProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GradientProvider;

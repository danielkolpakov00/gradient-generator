import { createContext, useContext, useState, useCallback, useEffect } from "react";
import PropTypes from "prop-types";
import { isLowEndDevice } from '../utils/performanceUtils';

export const GradientContext = createContext(null);

export const useGradient = () => {
  const context = useContext(GradientContext);
  if (!context) {
    throw new Error("useGradient must be used within a GradientProvider");
  }
  return context;
};

export function GradientProvider({ children }) {
  // State management
  const [gradDistortion, setGradDistortion] = useState(85);
  const [gradIntensity, setGradIntensity] = useState(90);
  const [gradComplexity, setGradComplexity] = useState(80);
  const [gradRotation, setGradRotation] = useState(0);
  const [gradScale, setGradScale] = useState(100);
  const [gradMouseEvents, setGradMouseEvents] = useState(false);
  const [animGrad, setAnimGrad] = useState(true); // Confirm animation is enabled by default
  const [gradInvert, setGradInvert] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [gradColorIndex, setGradColorIndex] = useState(0.5); // Changed from 50 to 0.5
  const [gradSpeed, setGradSpeed] = useState(1.0);
  const [gradBlur, setGradBlur] = useState(30);
  const [gradBrightness, setGradBrightness] = useState(100);

  // Auto-detect low-end devices during context initialization
  const [lowEndMode, setLowEndMode] = useState(() => {
    // Try to get from localStorage first, then fall back to auto-detection
    const savedMode = localStorage.getItem('lowEndMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    // Auto-detect based on device capabilities
    return isLowEndDevice();
  });

  // Save low-end mode preference when it changes
  useEffect(() => {
    localStorage.setItem('lowEndMode', lowEndMode);
  }, [lowEndMode]);

  // Debug the animation state when it changes
  useEffect(() => {
    console.log("Animation state updated:", animGrad);
  }, [animGrad]);

  const randomizeGradient = () => {
    setGradIntensity(85 + Math.random() * 15);  // 85-100
    setGradComplexity(75 + Math.random() * 25);  // 75-100
    setGradRotation(Math.random() * 360);
    setGradScale(150 + Math.random() * 50);  // 150-200
    setGradColorIndex(Math.random()); // Changed from Math.random() * 100
    setGradDistortion(60 + Math.random() * 40);  // 60-100
    setGradSpeed(0.1 + Math.random() * 3.9); // 0.1-4.0 speed range for more dramatic changes
    setGradBlur(20 + Math.random() * 60);        // 20-80
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
  }, []);

  const value = {
    gradDistortion, setGradDistortion,
    gradIntensity, setGradIntensity,
    gradComplexity, setGradComplexity,
    gradRotation, setGradRotation,
    gradScale, setGradScale,
    gradMouseEvents, setGradMouseEvents,
    gradInvert, setGradInvert,
    animGrad, setAnimGrad,
    randomizeGradient,
    currentMessage,
    triggerNewMessage,
    gradColorIndex, setGradColorIndex,
    gradSpeed, setGradSpeed,
    gradBlur, setGradBlur,
    gradBrightness, setGradBrightness,
    lowEndMode, setLowEndMode,
  };

  return (
    <GradientContext.Provider value={value}>
      <div style={{ width: "100vw", height: "100vh", position: "relative", overflow: "hidden" }}>
        {children}
      </div>
    </GradientContext.Provider>
  );
}

GradientProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GradientProvider;

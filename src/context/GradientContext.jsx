import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
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
  // State management with optimized initial values
  const [gradDistortion, setGradDistortion] = useState(85);
  const [gradIntensity, setGradIntensity] = useState(90);
  const [gradComplexity, setGradComplexity] = useState(80);
  const [gradRotation, setGradRotation] = useState(0);
  const [gradScale, setGradScale] = useState(100);
  const [gradMouseEvents, setGradMouseEvents] = useState(false);
  const [animGrad, setAnimGrad] = useState(true);
  const [gradInvert, setGradInvert] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [gradColorIndex, setGradColorIndex] = useState(0.5);
  const [gradSpeed, setGradSpeed] = useState(1.0);
  const [gradBlur, setGradBlur] = useState(30);
  const [gradBrightness, setGradBrightness] = useState(100);
  
  // New parameters for color control
  const [gradColorSaturation, setGradColorSaturation] = useState(0.8); // 0-1: color saturation
  const [gradColorSpread, setGradColorSpread] = useState(0.5); // 0-1: spread between colors
  const [gradColorMode, setGradColorMode] = useState(0); // 0-4: different palette types

  // Check for low-end device once on mount and get from localStorage
  const [lowEndMode, setLowEndMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('lowEndMode');
      if (savedMode !== null) {
        return savedMode === 'true';
      }
      return isLowEndDevice();
    } catch (e) {
      return false; // Default to false if localStorage fails
    }
  });

  // Debounced setters to reduce state updates
  const debouncedSetters = useMemo(() => {
    const debounce = (fn, delay) => {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
      };
    };
    
    return {
      setGradDistortion: debounce(setGradDistortion, 100),
      setGradComplexity: debounce(setGradComplexity, 100),
      setGradRotation: debounce(setGradRotation, 100),
      setGradScale: debounce(setGradScale, 100),
      setGradBlur: debounce(setGradBlur, 100),
      setGradBrightness: debounce(setGradBrightness, 100),
      setGradColorSaturation: debounce(setGradColorSaturation, 100),
      setGradColorSpread: debounce(setGradColorSpread, 100),
      setGradColorMode: debounce(setGradColorMode, 100)
    };
  }, []);

  // Save low-end mode preference when it changes
  useEffect(() => {
    try {
      localStorage.setItem('lowEndMode', String(lowEndMode));
    } catch (e) {
      console.warn("Could not save low-end mode setting:", e);
    }
  }, [lowEndMode]);

  // Memoized randomize function to avoid recreating it on every render
  const randomizeGradient = useCallback(() => {
    setGradIntensity(85 + Math.random() * 15);
    setGradComplexity(75 + Math.random() * 25);
    setGradRotation(Math.random() * 360);
    setGradScale(150 + Math.random() * 50);
    setGradColorIndex(Math.random());
    setGradDistortion(60 + Math.random() * 40);
    setGradSpeed(0.1 + Math.random() * 3.9);
    setGradBlur(20 + Math.random() * 60);
    
    // Randomize new color parameters
    setGradColorSaturation(0.7 + Math.random() * 0.3); // 0.7-1.0 for still colorful results
    setGradColorSpread(Math.random()); // 0-1 range
    setGradColorMode(Math.floor(Math.random() * 5)); // 0-4 integer values
    
    triggerNewMessage();
  }, []);

  // Optimized message function
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

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    gradDistortion, 
    setGradDistortion: debouncedSetters.setGradDistortion,
    gradIntensity, 
    setGradIntensity,
    gradComplexity, 
    setGradComplexity: debouncedSetters.setGradComplexity,
    gradRotation, 
    setGradRotation: debouncedSetters.setGradRotation,
    gradScale, 
    setGradScale: debouncedSetters.setGradScale,
    gradMouseEvents, 
    setGradMouseEvents,
    gradInvert, 
    setGradInvert,
    animGrad, 
    setAnimGrad,
    randomizeGradient,
    currentMessage,
    triggerNewMessage,
    gradColorIndex, 
    setGradColorIndex,
    gradSpeed, 
    setGradSpeed,
    gradBlur, 
    setGradBlur: debouncedSetters.setGradBlur,
    gradBrightness, 
    setGradBrightness: debouncedSetters.setGradBrightness,
    gradColorSaturation,
    setGradColorSaturation: debouncedSetters.setGradColorSaturation,
    gradColorSpread,
    setGradColorSpread: debouncedSetters.setGradColorSpread,
    gradColorMode,
    setGradColorMode: debouncedSetters.setGradColorMode,
    lowEndMode, 
    setLowEndMode,
  }), [
    gradDistortion, gradIntensity, gradComplexity, gradRotation, gradScale,
    gradMouseEvents, gradInvert, animGrad, currentMessage, gradColorIndex,
    gradSpeed, gradBlur, gradBrightness, gradColorSaturation, gradColorSpread, 
    gradColorMode, lowEndMode, debouncedSetters,
    randomizeGradient, triggerNewMessage
  ]);

  return (
    <GradientContext.Provider value={value}>
      <div className="w-full h-full relative overflow-hidden">
        {children}
      </div>
    </GradientContext.Provider>
  );
}

GradientProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default GradientProvider;

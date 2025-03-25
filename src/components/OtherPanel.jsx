import Companion from "./Companion";
import characterModel from "../assets/GradDude.glb";
import { useRef, useEffect, useState } from 'react';
import { useGradient } from "../context/GradientContext";

const OtherPanel = () => {
  const [displayedText, setDisplayedText] = useState('');
  const typingRef = useRef(null);
  const modelRef = useRef();
  const { currentMessage } = useGradient();
  const prevMessageRef = useRef('');
  const timeoutRef = useRef(null);
  const idleTimerRef = useRef(null);
  const backflipTimeoutRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const playAnimation = (modelViewer, animationName, duration) => {
    if (isAnimating) return; // Don't interrupt ongoing animations
    
    setIsAnimating(true);
    modelViewer.setAttribute('animation-name', animationName);
    
    setTimeout(() => {
      modelViewer.setAttribute('animation-name', 'Idle');
      setIsAnimating(false);
    }, duration);
  };

  const resetIdleTimer = () => {
    if (backflipTimeoutRef.current) {
      clearTimeout(backflipTimeoutRef.current);
    }
    
    const modelViewer = modelRef.current;
    if (!isAnimating) { // Only set new timer if not currently animating
      backflipTimeoutRef.current = setTimeout(() => {
        if (modelViewer && !isAnimating) {
          playAnimation(modelViewer, 'GangnamStyle', 12370);
        }
      }, 5000);
    }
  };

  useEffect(() => {
    const modelViewer = modelRef.current;
    if (modelViewer) {
      modelViewer.addEventListener('load', () => {
        console.log('Model loaded successfully');
        console.log('Available animations:', modelViewer.availableAnimations);
        modelViewer.animationName = 'Idle';
      });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const modelViewer = modelRef.current;
    if (modelViewer && currentMessage && currentMessage !== prevMessageRef.current && !isAnimating) {
      playAnimation(modelViewer, 'Talking', 3000);
      prevMessageRef.current = currentMessage;
    }
  }, [currentMessage, isAnimating]);

  useEffect(() => {
    if (currentMessage) {
      let index = 0;
      setDisplayedText('');
      
      // Clear any existing interval
      if (typingRef.current) clearInterval(typingRef.current);
      
      // Start new typing animation
      typingRef.current = setInterval(() => {
        if (index <= currentMessage.length) {
          setDisplayedText(currentMessage.slice(0, index));
          index++;
        } else {
          clearInterval(typingRef.current);
        }
      }, 40);
    }

    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
    };
  }, [currentMessage]);

  useEffect(() => {
    // Set up global interaction listeners
    const handleInteraction = () => resetIdleTimer();
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('keypress', handleInteraction);
    window.addEventListener('click', handleInteraction);
    window.addEventListener('scroll', handleInteraction);

    // Initial timer
    resetIdleTimer();

    return () => {
      // Cleanup
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('keypress', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('scroll', handleInteraction);
      if (backflipTimeoutRef.current) {
        clearTimeout(backflipTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col items-start justify-center h-full w-full text-white text-sm font-mono gap-1">
      <div className="relative w-[300px] h-[300px] ml-8">
        <model-viewer
          ref={modelRef}
          src={characterModel}
          animation-name="Idle"
          camera-controls
          autoplay
          granularity="10"
          field-of-view="30deg"
          min-field-of-view="30deg"
          max-field-of-view="30deg"
          disable-zoom
          disable-pan
          interaction-prompt="none"
          min-camera-orbit="350deg 90deg 4m"
          max-camera-orbit="350deg 90deg 4m"
          exposure="5"
          shadow-intensity="1"
          shadow-softness="0"
          environment-image="neutral"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            cursor: 'default'
          }}
        ></model-viewer>
        <Companion />
        
        {/* Speech bubble */}
        <div className="absolute top-[25%] -translate-y-1/2 left-[200px] bg-black/80 p-3 rounded-lg w-[200px]">
          <div className="text-center text-xs">
            {displayedText}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtherPanel;

import Companion from "./Companion";
import characterModel from "../assets/dude.glb";
import { useRef, useEffect } from 'react';
import TypeIt from "typeit-react";
import { useGradient } from "../context/GradientContext";

const OtherPanel = () => {
  const modelRef = useRef();
  const { currentMessage } = useGradient();
  const prevMessageRef = useRef('');
  const timeoutRef = useRef(null);

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
    if (modelViewer && currentMessage && currentMessage !== prevMessageRef.current) {
      // Start talking animation
      modelViewer.setAttribute('animation-name', 'Talking.001');
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set timeout to switch back to idle after 2 seconds
      timeoutRef.current = setTimeout(() => {
        modelViewer.setAttribute('animation-name', 'Idle');
      }, 6000);

      prevMessageRef.current = currentMessage;
    }
  }, [currentMessage]);

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
        <div className="absolute top-[25%] -translate-y-1/2 left-[320px] bg-black/80 p-3 rounded-lg w-[200px]">
          <TypeIt
            key={currentMessage}
            options={{
              speed: 50,
              waitUntilVisible: true,
              cursor: false,
            }}
          >
            {/* Text placement during loading */}
            {!currentMessage && (
              <div className="text-center text-xs">
                Loading...
              </div>
            )}
            {currentMessage}
          </TypeIt>
        </div>
      </div>
    </div>
  );
};

export default OtherPanel;

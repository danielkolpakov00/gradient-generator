import { useGradient } from "../context/GradientContext";
import { useRef, memo, useCallback } from 'react';

// Memoize the Slider component to avoid re-renders when other sliders change
const Slider = memo(({ label, value, onChange, min = 0, max = 100, step = 1 }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold uppercase">{label}</label>
    <input
      type="range"
      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer 
      [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full
      [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      step={step}
    />
    <span className="text-xs text-white/50">{value}</span>
  </div>
));

Slider.displayName = 'Slider';

// Add a new component for color mode selection
const ColorModeSelector = memo(({ value, onChange }) => {
  const modes = [
    { id: 0, name: "WARM" },
    { id: 1, name: "COOL" },
    { id: 2, name: "PASTEL" },
    { id: 3, name: "VIBRANT" },
    { id: 4, name: "MULTI" }
  ];
  
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold uppercase">COLOR_MODE</label>
      <div className="flex flex-wrap gap-2">
        {modes.map(mode => (
          <button
            key={mode.id}
            onClick={() => onChange(mode.id)}
            className={`text-xs px-2 py-1 border ${value === mode.id ? 'bg-white text-black' : 'border-white/50 text-white/70'}`}
          >
            {mode.name}
          </button>
        ))}
      </div>
    </div>
  );
});

ColorModeSelector.displayName = 'ColorModeSelector';

const SettingsPanel = memo(({ visualPanelRef }) => {
  const {
    gradIntensity,
    setGradIntensity,
    gradComplexity,
    setGradComplexity,
    gradRotation,
    setGradRotation,
    gradScale,
    setGradScale,
    gradDistortion,
    setGradDistortion,
    gradColorIndex,
    setGradColorIndex,
    gradSpeed,
    setGradSpeed,
    gradBlur, setGradBlur,
    gradBrightness, setGradBrightness,
    // New color parameters
    gradColorSaturation, setGradColorSaturation,
    gradColorSpread, setGradColorSpread,
    gradColorMode, setGradColorMode,
    lowEndMode,
    setLowEndMode,
    triggerNewMessage,
    randomizeGradient
  } = useGradient();

  // Refs to track active slider to prevent too many updates
  const isChangingRef = useRef(false);
  
  // Use cached handlers to avoid re-creates on render
  const handleSliderChange = useCallback((setter, value) => {
    isChangingRef.current = true;
    
    const finalValue = setter === setGradColorIndex ? value / 100 : value;
    setter(finalValue);
    
    // Delay triggering new message to avoid spamming
    clearTimeout(isChangingRef.timeout);
    isChangingRef.timeout = setTimeout(() => {
      if (typeof triggerNewMessage === 'function') {
        triggerNewMessage();
      }
      isChangingRef.current = false;
    }, 500);
  }, [triggerNewMessage, setGradColorIndex]);

  // Handler for color mode changes
  const handleColorModeChange = useCallback((mode) => {
    setGradColorMode(mode);
    if (typeof triggerNewMessage === 'function') {
      triggerNewMessage();
    }
  }, [setGradColorMode, triggerNewMessage]);

  const handleExport = useCallback(() => {
    if (visualPanelRef?.current?.exportGradient) {
      visualPanelRef.current.exportGradient().then(dataUrl => {
        if (dataUrl) {
          const link = document.createElement('a');
          link.download = 'gradient.png';
          link.href = dataUrl;
          link.click();
        }
      });
    }
  }, [visualPanelRef]);

  const handleRandomize = useCallback(() => {
    if (typeof randomizeGradient === 'function') {
      randomizeGradient();
    }
  }, [randomizeGradient]);

  const handleLowEndModeToggle = useCallback((e) => {
    setLowEndMode(e.target.checked);
  }, [setLowEndMode]);

  return (
    <div className="flex h-full flex-col gap-6 p-4 pt-12 text-white">
      <div className="grid grid-cols-1 gap-6">
        <Slider
          label="GRAD_INTENSITY"
          value={gradIntensity}
          onChange={(value) => handleSliderChange(setGradIntensity, value)}
        />
        <Slider
          label="GRAD_COMPLEXITY"
          value={gradComplexity}
          onChange={(value) => handleSliderChange(setGradComplexity, value)}
        />
        <Slider
          label="GRAD_ROTATION"
          value={gradRotation}
          onChange={(value) => handleSliderChange(setGradRotation, value)}
          max={360}
        />
        <Slider
          label="GRAD_SCALE"
          value={gradScale}
          onChange={(value) => handleSliderChange(setGradScale, value)}
          max={200}
        />
        <Slider
          label="GRAD_DISTORTION"
          value={gradDistortion}
          onChange={(value) => handleSliderChange(setGradDistortion, value)}
        />
        <Slider
          label="GRAD_COLOR_INDEX"
          value={gradColorIndex * 100}
          onChange={(value) => handleSliderChange(setGradColorIndex, value)}
          min={0}
          max={1000}
          step={1}
        />
        
        {/* New color controls */}
        <Slider
          label="COLOR_SATURATION"
          value={gradColorSaturation * 100}
          onChange={(value) => handleSliderChange(setGradColorSaturation, value / 100)}
          min={30}
          max={100}
          step={1}
        />
        <Slider
          label="COLOR_SPREAD"
          value={gradColorSpread * 100}
          onChange={(value) => handleSliderChange(setGradColorSpread, value / 100)}
          min={10}
          max={100}
          step={1}
        />
        
        <ColorModeSelector
          value={gradColorMode}
          onChange={handleColorModeChange}
        />
        
        <Slider
          label="GRAD_SPEED"
          value={gradSpeed * 25}
          onChange={(value) => handleSliderChange(setGradSpeed, value / 25)}
          min={0}
          max={100}
          step={1}
        />
        <Slider
          label="GRAD_BLUR"
          value={gradBlur}
          onChange={(value) => handleSliderChange(setGradBlur, value)}
          min={0}
          max={100}
          step={1}
        />
        <Slider
          label="GRAD_BRIGHTNESS"
          value={gradBrightness}
          onChange={(value) => handleSliderChange(setGradBrightness, value)}
          min={0}
          max={200}
          step={1}
        />
        {/* Toggle for low-end mode */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={lowEndMode}
            onChange={handleLowEndModeToggle}
            id="low-end-mode"
          />
          <label htmlFor="low-end-mode" className="text-xs font-bold uppercase">Low End Mode</label>
        </div>
      </div>
      <div className="mt-auto flex justify-between items-center">
        <button
          onClick={handleRandomize}
          className="text-white text-xs hover:text-white/50 border border-white px-1 py-1 transition-all"
        >
          RAND_GRAD
        </button>
        <button
          onClick={handleExport}
          className="text-white text-xs hover:text-white/50 border border-white px-1 py-1 transition-all"
        >
          EXPORT_GRAD
        </button>
      </div>
    </div>
  );
});

SettingsPanel.displayName = 'SettingsPanel';
export default SettingsPanel;

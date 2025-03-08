import { useGradient } from "../context/GradientContext";
import { useRef } from 'react';

const Slider = ({ label, value, onChange, min = 0, max = 100, step = 1 }) => (
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
);

const SettingsPanel = ({ visualPanelRef }) => {
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
    lowEndMode,
    setLowEndMode,
    triggerNewMessage,
  } = useGradient();

  const handleSliderChange = (setter, value) => {
    const finalValue = setter === setGradColorIndex ? value / 100 : value;
    setter(finalValue);
    if (typeof triggerNewMessage === 'function') {
      triggerNewMessage();
    }
  };

  const handleExport = () => {
    if (visualPanelRef?.current) {
      const dataUrl = visualPanelRef.current.exportGradient();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = 'gradient.png';
        link.href = dataUrl;
        link.click();
      }
    }
  };

  const generateRandomValues = () => {
    setGradIntensity(Math.floor(Math.random() * 31) + 70);
    setGradComplexity(Math.floor(Math.random() * 41) + 40);
    setGradRotation(Math.floor(Math.random() * 360));
    setGradScale(Math.floor(Math.random() * 151) + 50);
    setGradDistortion(Math.floor(Math.random() * 31) + 40);
    setGradColorIndex(Math.ceil(Math.random() * 10000));
    setGradBlur(Math.floor(Math.random() * 100));
    setGradBrightness(Math.floor(Math.random() * 100) + 35);
  };

  const handleRandomize = () => {
    generateRandomValues();
    if (typeof triggerNewMessage === 'function') {
      triggerNewMessage();
    }
  };

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
          max={1000000}
          step="1"
        />
        <Slider
          label="GRAD_SPEED"
          value={gradSpeed * 25}
          onChange={(value) => handleSliderChange(setGradSpeed, value / 25)}
          min={0}
          max={100}
          step="0.01"
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
            onChange={(e) => setLowEndMode(e.target.checked)}
          />
          <span className="text-xs font-bold uppercase">Low End Mode</span>
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
};

export default SettingsPanel;

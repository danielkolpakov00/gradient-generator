import { useGradient } from "../context/GradientContext";

const Slider = ({ label, value, onChange, min = 0, max = 100 }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-bold uppercase">{label}</label>
    <input
      type="range"
      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer 
      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full 
      [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-2 [&::-moz-range-thumb]:h-2 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    />
    <span className="text-xs text-white/50">{value}</span>
  </div>
);

const SettingsPanel = () => {
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
    randomizeGradient,
    triggerNewMessage,
  } = useGradient();

  const handleSliderChange = (setter, value) => {
    // Immediate update without triggering re-render
    setter(value);
    // Optional: only trigger message on slider release
    // if (typeof triggerNewMessage === 'function') {
    //   triggerNewMessage();
    // }
  };

  const handleExport = () => {
    // Create a new canvas element to capture the gradient with effects
    const tempCanvas = document.createElement('canvas');
    const ctx = tempCanvas.getContext('2d');
    const sourceCanvas = document.querySelector('canvas');

    if (sourceCanvas) {
      // Match size of source canvas
      tempCanvas.width = sourceCanvas.width;
      tempCanvas.height = sourceCanvas.height;

      // Apply the blur filter
      ctx.filter = 'blur(8px)';  // Match your blur settings
      
      // Draw the source canvas content with the filter applied
      ctx.drawImage(sourceCanvas, 0, 0);

      // Get the filtered image data
      const dataURL = tempCanvas.toDataURL('image/png');
      
      // Create download link
      const link = document.createElement('a');
      link.download = 'gradient.png';
      link.href = dataURL;
      link.click();
    } else {
      alert('Canvas not found!');
    }
  };

  const generateRandomValues = () => {
    // Generate random values within meaningful ranges
    setGradIntensity(Math.floor(Math.random() * 31) + 70);  // 70-100
    setGradComplexity(Math.floor(Math.random() * 41) + 40); // 40-80
    setGradRotation(Math.floor(Math.random() * 360));       // 0-360
    setGradScale(Math.floor(Math.random() * 151) + 50);     // 50-200
    setGradDistortion(Math.floor(Math.random() * 31) + 40); // 40-70
    setGradColorIndex(Math.floor(Math.random() * 100));     // 0-100
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
          value={gradColorIndex}
          onChange={(value) => handleSliderChange(setGradColorIndex, value)}
        />
      </div>
      <div className="mt-auto flex justify-between items-center">
        <button
          onClick={handleRandomize}
          className="text-white text-xs hover:text-white/50 border border-white px-1 py-1  hover:border-white/50 transition-all"
        >
          RAND_GRAD
        </button>
        <button
          onClick={handleExport}
          className="text-white text-xs hover:text-white/50 border border-white px-1 py-1  hover:border-white/50 transition-all"
        >
          EXPORT_GRAD
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;

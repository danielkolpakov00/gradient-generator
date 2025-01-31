import { useEffect, useRef } from "react";
import { useGradient } from "../context/GradientContext";

const VisualPanel = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const {
    gradIntensity,
    gradComplexity,
    gradScale,
    animGrad,
  } = useGradient();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let time = 0;

    const generatePsychedelicGradient = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Base hue cycling
      const baseHue = (t * 40) % 360;

      // Simplified layers for bold color regions
      for (let i = 0; i < 3; i++) {
        const frequency = 0.005 * (gradComplexity / 50 + i * 0.3);
        const timeScale = t * (0.2 + i * 0.05);

        for (let x = 0; x < canvas.width; x += 15) {
          for (let y = 0; y < canvas.height; y += 15) {
            const noise1 = Math.sin(x * frequency + timeScale) * Math.cos(y * frequency - timeScale);
            const noise2 = Math.cos(x * frequency - timeScale) * Math.sin(y * frequency + t);

            const distortion = 25 * (gradIntensity / 50);
            const offsetX = noise1 * distortion;
            const offsetY = noise2 * distortion;

            const gradient = ctx.createRadialGradient(
              x + offsetX,
              y + offsetY,
              0,
              x + offsetX,
              y + offsetY,
              100 * (gradScale / 100)
            );

            // More defined hues for bold contrasts
            const hue1 = (baseHue + noise1 * 120 + i * 40) % 360;
            const hue2 = (hue1 + 90) % 360;
            const hue3 = (hue2 + 90) % 360;

            gradient.addColorStop(0, `hsla(${hue1}, 100%, 65%, 0.1)`); // Bold and vibrant
            gradient.addColorStop(0.5, `hsla(${hue2}, 85%, 70%, 0.3)`);
            gradient.addColorStop(1, `hsla(${hue3}, 90%, 75%, 0.2)`);

            ctx.globalCompositeOperation = i % 2 === 0 ? "screen" : "overlay";
            ctx.fillStyle = gradient;
            ctx.fillRect(x, y, 15, 15);
          }
        }
      }

      // Add smoother blending texture
      ctx.globalCompositeOperation = "lighter";
      const overlayGrad = ctx.createLinearGradient(
        canvas.width / 2 + Math.sin(t * 0.3) * 200,
        canvas.height / 2 + Math.cos(t * 0.3) * 200,
        canvas.width / 2 - Math.sin(t * 0.3) * 200,
        canvas.height / 2 - Math.cos(t * 0.3) * 200
      );

      const overlayHue = (baseHue + t * 60) % 360;
      overlayGrad.addColorStop(0, `hsla(${overlayHue}, 80%, 60%, 0.3)`);
      overlayGrad.addColorStop(1, `hsla(${(overlayHue + 180) % 360}, 70%, 50%, 0.3)`);

      ctx.fillStyle = overlayGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      time += 0.01;
      generatePsychedelicGradient(time);
      animationRef.current = requestAnimationFrame(animate);
    };

    if (animGrad) animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [gradIntensity, gradComplexity, gradScale, animGrad]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{
        filter: "blur(8px) saturate(120%) contrast(180%) sepia(20%)",
       
        boxShadow: "0 0 200px 100px rgba(0, 0, 0, 0.5)", // Increased spread and blur radius
        backgroundColor: "#000",
      }}
    />
  );
};

export default VisualPanel;

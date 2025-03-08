import { useGradient } from "../context/GradientContext";

const Companion = () => {
  const { triggerNewMessage } = useGradient();

  const handleInteraction = () => {
    triggerNewMessage();
  };

  return (
    <div
      className="companion-container"
      style={{
        position: "relative",
        bottom: "-30px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        width: "200px",
        height: "auto",
      }}
    >
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleInteraction}
      ></div>
    </div>
  );
};

export default Companion;

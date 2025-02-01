import { useState, useEffect } from "react";

const Companion = () => {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (showMessage) {
      timeoutId = setTimeout(() => setShowMessage(false), 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showMessage]);

  const handleInteraction = () => {
    setShowMessage(true);
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
      {/* Speech Bubble */}
      {showMessage && (
        <div
          className="bg-white text-black px-4 py-2 rounded-md shadow-lg mt-2"
          style={{
            fontSize: "12px",
            fontFamily: '"Press Start 2P", monospace',
          }}
        >
          Cool Colour Bro
        </div>
      )}

      {/* Click Interaction */}
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={handleInteraction}
      ></div>
    </div>
  );
};

export default Companion;

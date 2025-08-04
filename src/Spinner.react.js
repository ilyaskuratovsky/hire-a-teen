import React from "react";

const Spinner = ({ size = 40, color = "#4f8cff" }) => (
  <div
    style={{
      display: "inline-block",
      width: size,
      height: size,
    }}
  >
    <div
      style={{
        border: `${size * 0.1}px solid #e3e3e3`,
        borderTop: `${size * 0.1}px solid ${color}`,
        borderRadius: "50%",
        width: size,
        height: size,
        animation: "spin 1s linear infinite",
      }}
    />
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}
    </style>
  </div>
);

export default Spinner;

import React from "react";

function HowItWorks() {
  return (
    <div
      style={{
        maxWidth: 700,
        margin: "0 auto 0px auto",
        textAlign: "center",
        background: "rgba(56,161,255,0.10)",
        borderRadius: 18,
        padding: "0px 18px 18px 18px",
        boxShadow: "0 2px 12px rgba(56,161,255,0.07)",
      }}
    >
      <h2
        style={{
          fontSize: 26,
          fontWeight: 700,
          color: "#38a1ff",
          marginBottom: 18,
          letterSpacing: 0.5,
        }}
      >
        How It Works
      </h2>
      <div>
        {[
          {
            num: 1,
            text: "Request a service by clicking a button below.",
          },
          {
            num: 2,
            text: "We'll find a Greenwich teen available for your job and contact you.",
          },
          {
            num: 3,
            text: "Finalize your job by confirming with the person we recommended.",
          },
        ].map((step) => (
          <div
            key={step.num}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              margin: "0 auto 18px auto",
              maxWidth: 600,
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 1px 6px rgba(56,161,255,0.07)",
              padding: "14px 18px",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: "#38a1ff",
                color: "#fff",
                fontWeight: "bold",
                fontSize: 22,
                marginRight: 18,
                boxShadow: "0 2px 8px rgba(56,161,255,0.13)",
                flexShrink: 0,
              }}
            >
              {step.num}
            </span>
            <span
              style={{
                textAlign: "left",
                color: "#222",
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              {step.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HowItWorks;

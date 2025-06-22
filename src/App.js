import React, { useState } from "react";
import logo from "./logo.svg";
import emailjs from "emailjs-com";
import "./App.css";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Add an "order" property to each form field
  const buttons = [
    {
      title: "Babysitting",
      subtitle: "Care for kids in your area",
      formTitle: "Babysitting Request",
      formFields: [
        { name: "address", label: "Address", type: "address", order: 2 },
        { name: "name", label: "Name", type: "text", order: 1 },
        { name: "when", label: "When (Date/Time)", type: "text", order: 3 },
        {
          name: "notes",
          label: "Additional Notes",
          type: "notes",
          order: 4,
        },
      ],
    },
    {
      title: "Dog Walking/Pet Sitting",
      subtitle: "Help with pets",
      formTitle: "Dog Walking/Pet Sitting Request",
      formFields: [
        { name: "address", label: "Address", type: "address", order: 1 },
        { name: "name", label: "Name", type: "text", order: 2 },
        { name: "when", label: "When", type: "text", order: 3 },
      ],
    },
    {
      title: "Sports Lessons",
      subtitle: "Teach or coach sports",
      formTitle: "Sports Lessons Request",
      formFields: [
        { name: "address", label: "Address", type: "address", order: 1 },
        { name: "name", label: "Name", type: "text", order: 2 },
        { name: "when", label: "When", type: "text", order: 3 },
      ],
    },
    {
      title: "Academic Tutoring",
      subtitle: "Help with schoolwork",
      formTitle: "Academic Tutoring Request",
      formFields: [
        { name: "address", label: "Address", type: "address", order: 1 },
        { name: "name", label: "Name", type: "text", order: 2 },
        { name: "when", label: "When", type: "text", order: 3 },
      ],
    },
    {
      title: "Private Lessons",
      subtitle: "Music, Sports, Arts",
      formTitle: "Private Lessons Request",
      formFields: [
        { name: "address", label: "Address", type: "address", order: 1 },
        { name: "name", label: "Name", type: "text", order: 2 },
        { name: "when", label: "When", type: "text", order: 3 },
      ],
    },
    {
      title: "Yard Work",
      subtitle: "Mowing, weeding, gardening",
      formTitle: "Yard Work Request",
      formFields: [
        { name: "address", label: "Address", type: "address", order: 1 },
        { name: "name", label: "Name", type: "text", order: 2 },
        { name: "when", label: "When", type: "text", order: 3 },
      ],
    },
    {
      title: "Snow Shoveling",
      subtitle: "Clear driveways & walks",
      formTitle: "Snow Shoveling Request",
      formFields: [
        { name: "address", label: "Address", type: "address", order: 1 },
        { name: "name", label: "Name", type: "text", order: 2 },
        { name: "when", label: "When", type: "text", order: 3 },
      ],
    },
    {
      title: "Car Detailing",
      subtitle: "Clean and detail vehicles",
      formTitle: "Car Detailing Request",
      formFields: [
        { name: "address", label: "Address", type: "address", order: 1 },
        { name: "name", label: "Name", type: "text", order: 2 },
        { name: "when", label: "When", type: "text", order: 3 },
      ],
    },
    {
      title: "Photography",
      subtitle: "Capture special moments",
      formTitle: "Photography Request",
      formFields: [
        { name: "address", label: "Address", type: "address", order: 1 },
        { name: "name", label: "Name", type: "text", order: 2 },
        { name: "when", label: "When", type: "text", order: 3 },
      ],
    },
    {
      title: "Other",
      subtitle: "Custom requests",
      formTitle: "Other Request",
      formFields: [
        { name: "address", label: "Address", type: "address", order: 1 },
        { name: "name", label: "Name", type: "text", order: 2 },
        { name: "when", label: "When", type: "text", order: 3 },
      ],
    },
  ];

  // Form state for all fields
  const [formValues, setFormValues] = useState({});

  const handleOpenModal = (btn) => {
    setActiveForm(btn);
    // Reset form values for new form
    setFormValues({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormValues((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const message = activeForm.formFields
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(
        (field) =>
          `${field.label}: ${formValues[field.name] ? formValues[field.name] : ""}`
      )
      .join("\n");

    // Prepare template params for EmailJS
    const templateParams = {
      type: activeForm.title,
      message,
      ...formValues,
    };

    // Replace these with your EmailJS values
    //const SERVICE_ID = "service_yyupiua";
    //const TEMPLATE_ID = "template_0xbtn68";
    //const TEMPLATE_ID = "template_bscjeem";
    //const USER_ID = "K_WhNfwPe38QSV54i";
    const SERVICE_ID = "service_9jynhfj";
    const TEMPLATE_ID = "template_7c6kzgr";
    const USER_ID = "fbF9XXilrLgIe1NID";
    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID).then(
      (result) => {
        setShowModal(false);
        setShowConfirmation(true);
      },
      (error) => {
        alert("Failed to send request.: " + JSON.stringify(error));
      }
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1
          style={{
            fontSize: 48,
            fontWeight: "bold",
            marginBottom: 24,
            letterSpacing: 1,
            color: "#38a1ff",
            textShadow: "0 2px 12px rgba(79,140,255,0.15)",
          }}
        >
          Greenwich Hire-A-Teen
        </h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
            margin: "40px 0",
            justifyItems: "center",
            alignItems: "center",
          }}
        >
          {buttons.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => handleOpenModal(btn)}
              style={{
                width: 260,
                height: 140,
                padding: 20,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 32,
                fontWeight: "bold",
                borderRadius: 24,
                background: "linear-gradient(90deg, #4f8cff 0%, #38e8ff 100%)",
                color: "#fff",
                border: "none",
                boxShadow: "0 6px 24px rgba(0,0,0,0.18)",
                cursor: "pointer",
                transition: "transform 0.1s, box-shadow 0.1s",
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.97)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              <span>{btn.title}</span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: "normal",
                  opacity: 0.85,
                  marginTop: 4,
                }}
              >
                {btn.subtitle}
              </span>
            </button>
          ))}
        </div>
      </header>
      {showModal && activeForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 24,
              borderRadius: 8,
              minWidth: 300,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <h2>{activeForm.formTitle}</h2>
            <form onSubmit={handleSubmit}>
              {activeForm.formFields
                .slice()
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <div
                    key={field.name}
                    style={{
                      marginBottom: 18,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <label
                      style={{
                        marginBottom: 6,
                        fontWeight: 500,
                        fontSize: 16,
                        textAlign: "left",
                      }}
                    >
                      {field.label}
                    </label>
                    {field.type === "address" || field.name === "notes" ? (
                      <textarea
                        name={field.name}
                        value={formValues[field.name] || ""}
                        onChange={handleChange}
                        rows={field.name === "notes" ? 6 : 3}
                        style={{ width: 400, fontSize: 16, resize: "vertical" }}
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formValues[field.name] || ""}
                        onChange={handleChange}
                        style={{ width: 400, fontSize: 16 }}
                      />
                    )}
                  </div>
                ))}
              <div
                style={{
                  display: "flex",
                  gap: 20,
                  marginTop: 24,
                  justifyContent: "center", // center the buttons horizontally
                  width: "100%",
                }}
              >
                <button
                  type="submit"
                  style={{
                    background: "#4f8cff",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 17,
                    padding: "10px 28px",
                    border: "none",
                    borderRadius: 16,
                    boxShadow: "0 1px 4px rgba(56,168,255,0.10)",
                    cursor: "pointer",
                    transition: "background 0.2s, transform 0.1s",
                  }}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = "scale(0.97)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: "#ff6a6a",
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 17,
                    padding: "10px 28px",
                    border: "none",
                    borderRadius: 16,
                    boxShadow: "0 1px 4px rgba(255,106,106,0.10)",
                    cursor: "pointer",
                    transition: "background 0.2s, transform 0.1s",
                  }}
                  onMouseDown={(e) =>
                    (e.currentTarget.style.transform = "scale(0.97)")
                  }
                  onMouseUp={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showConfirmation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 32,
              borderRadius: 12,
              minWidth: 320,
              boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#38a1ff", marginBottom: 16 }}>Thank you!</h2>
            <p style={{ fontSize: 18, marginBottom: 24 }}>
              Your request has been submitted.
              <br />
              We appreciate your interest in Greenwich Hire-A-Teen.
            </p>
            <button
              onClick={() => setShowConfirmation(false)}
              style={{
                background: "#4f8cff",
                color: "#fff",
                fontWeight: "bold",
                fontSize: 17,
                padding: "10px 32px",
                border: "none",
                borderRadius: 16,
                boxShadow: "0 1px 4px rgba(56,168,255,0.10)",
                cursor: "pointer",
                transition: "background 0.2s, transform 0.1s",
              }}
              onMouseDown={(e) =>
                (e.currentTarget.style.transform = "scale(0.97)")
              }
              onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

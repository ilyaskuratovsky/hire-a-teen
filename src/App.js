import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import db from "./firebase"; // Import your Firestore instance
import { sendEmail } from "./EmailService.js";

import emailjs from "emailjs-com";
import "./App.css";
import BUTTONS from "./buttons.js"; // Import the buttons configuration
import HowItWorks from "./HowItWorks.react";

function App() {
  const [showModal, setShowModal] = useState(false);
  const [activeForm, setActiveForm] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Form state for all fields
  const [formValues, setFormValues] = useState({});

  // State for Teen Signup Dialog
  const [showTeenSignup, setShowTeenSignup] = useState(false);
  const [teenForm, setTeenForm] = useState({
    name: "",
    phone: "",
    email: "",
    interests: "",
    school: "",
  });
  const [teenSignupSent, setTeenSignupSent] = useState(false);

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

  const handleTeenChange = (e) => {
    const { name, value } = e.target;
    setTeenForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const message = activeForm.formFields
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((field) => {
        if (field.type === "date_time") {
          const date = formValues[`${field.name}_date`] || "";
          const start = formValues[`${field.name}_start`] || "";
          const end = formValues[`${field.name}_end`] || "";
          return `${field.label}: ${date} ${start ? "from " + start : ""}${end ? " to " + end : ""}`;
        }
        return `${field.label}: ${formValues[field.name] ? formValues[field.name] : ""}`;
      })
      .join("\n");

    // Prepare template params for EmailJS
    const templateParams = {
      type: activeForm.title,
      message,
      ...formValues,
    };

    // Save job request to Firestore
    const jobData = {
      type: activeForm.title,
      ...formValues,
      createdAt: new Date(),
    };
    try {
      await addDoc(collection(db, "jobs"), jobData);
    } catch (err) {
      alert(
        "Request failed: " +
          err.message +
          ", please notify the administrator or try again later."
      );
    }

    // Send email as before
    sendEmail(templateParams).then(
      (result) => {
        setShowModal(false);
        setShowConfirmation(true);
      },
      (error) => {
        alert(
          "Failed to send signup: " +
            JSON.stringify(error) +
            ". Please alert the administrator."
        );
      }
    );
  };

  const handleTeenSubmit = async (e) => {
    e.preventDefault();
    const message = [
      "Name: " + teenForm.name,
      "Phone: " + teenForm.phone,
      "Email: " + teenForm.email,
      "School: " + teenForm.school,
      "Interests: " + teenForm.interests,
    ].join("\n");

    const templateParams = {
      type: "Teen Signup",
      message,
    };

    sendEmail(templateParams).then(
      () => {
        setTeenSignupSent(true);
        setTimeout(() => {
          setShowTeenSignup(false);
          setTeenSignupSent(false);
          setTeenForm({
            name: "",
            phone: "",
            email: "",
            interests: "",
            school: "",
          });
        }, 2000);
      },
      (error) => {
        alert(
          "Failed to send signup: " +
            JSON.stringify(error) +
            ". Please alert the administrator."
        );
      }
    );
    /*
    const SERVICE_ID = "service_9jynhfj";
    const TEMPLATE_ID = "template_7c6kzgr";
    const USER_ID = "fbF9XXilrLgIe1NID";
    emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID).then(
      () => {
        setTeenSignupSent(true);
        setTimeout(() => {
          setShowTeenSignup(false);
          setTeenSignupSent(false);
          setTeenForm({
            name: "",
            phone: "",
            email: "",
            interests: "",
            school: "",
          });
        }, 2000);
      },
      (error) => {
        alert("Failed to send signup: " + JSON.stringify(error));
      }
    );
    */
    // Save to Firestore
    const teenData = {
      name: teenForm.name,
      phone: teenForm.phone,
      email: teenForm.email,
      school: teenForm.school,
      interests: teenForm.interests,
      createdAt: new Date(),
    };
    await addDoc(collection(db, "teens"), teenData);
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
          Need a helping hand this summer? Hire a local Greenwich teen.
        </h1>
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
          <HowItWorks />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              window.innerWidth < 600
                ? "1fr"
                : window.innerWidth < 900
                  ? "1fr 1fr"
                  : "repeat(3, 1fr)",
            gap: 24,
            margin: "40px 0",
            justifyItems: "center",
            alignItems: "center",
            justifyContent: "center", // This ensures centering when not all columns are filled
            transition: "grid-template-columns 0.2s",
          }}
        >
          {BUTTONS.map((btn, idx) => (
            <button
              key={idx}
              onClick={() => handleOpenModal(btn)}
              style={{
                width: "100%",
                maxWidth: 260,
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
                  fontSize: 22,
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
        <div
          style={{
            margin: "48px auto 0 auto",
            maxWidth: 340,
            textAlign: "center",
            padding: "18px 0 0 0",
          }}
        >
          <button
            style={{
              width: "100%",
              padding: "18px 18px 18px 18px", // Increased left/right padding
              borderRadius: 14,
              background: "linear-gradient(90deg, #b71234 0%, #ffc72c 100%)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 26, // Bigger font
              border: "none",
              boxShadow: "0 2px 8px rgba(35,31,32,0.10)",
              cursor: "pointer",
              marginBottom: 6,
              letterSpacing: 0.2,
              transition: "background 0.2s, transform 0.1s",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              lineHeight: 1.2,
            }}
            onClick={() => setShowTeenSignup(true)}
          >
            Greenwich Teen Signup
            <span
              style={{
                fontSize: 17,
                fontWeight: 400,
                color: "#fff",
                opacity: 0.85,
                marginTop: 6,
                letterSpacing: 0.1,
              }}
            >
              (Are you looking to work this summer?)
            </span>
          </button>
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
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      {field.label}
                      {!field.optional && (
                        <span
                          style={{ color: "#ff4d4f", fontSize: 18 }}
                          title="Required"
                        >
                          *
                        </span>
                      )}
                      {field.optional && (
                        <span
                          style={{
                            color: "#888",
                            fontSize: 14,
                            fontWeight: 400,
                          }}
                        >
                          (optional)
                        </span>
                      )}
                    </label>
                    {field.type === "dropdown" ? (
                      <select
                        name={field.name}
                        value={formValues[field.name] || ""}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          fontSize: 16,
                          padding: "8px 6px",
                          borderRadius: 6,
                          border: "1px solid #bbb",
                          background: "#fff",
                          color: formValues[field.name] ? "#222" : "#888",
                        }}
                        required={!field.optional}
                      >
                        <option value="" disabled>
                          {field.placeholder || "Select an option"}
                        </option>
                        {field.options &&
                          field.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                      </select>
                    ) : field.type === "address" || field.name === "notes" ? (
                      <textarea
                        name={field.name}
                        value={formValues[field.name] || ""}
                        onChange={handleChange}
                        rows={field.name === "notes" ? 4 : 2}
                        style={{
                          width: "100%",
                          fontSize: 16,
                          resize: "vertical",
                        }}
                      />
                    ) : field.type === "date_time" ? (
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <input
                          type="date"
                          name={`${field.name}_date`}
                          value={formValues[`${field.name}_date`] || ""}
                          onChange={handleChange}
                          style={{ fontSize: 16 }}
                        />
                        <input
                          type="time"
                          name={`${field.name}_start`}
                          value={formValues[`${field.name}_start`] || ""}
                          onChange={handleChange}
                          style={{ fontSize: 16 }}
                        />
                        <span style={{ fontSize: 14 }}>to</span>
                        <input
                          type="time"
                          name={`${field.name}_end`}
                          value={formValues[`${field.name}_end`] || ""}
                          onChange={handleChange}
                          style={{ fontSize: 16 }}
                        />
                      </div>
                    ) : field.type === "checkbox_group" ? (
                      <div style={{ display: "flex", gap: 16 }}>
                        {field.options.map((opt) => (
                          <label
                            key={opt.value}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <input
                              type="checkbox"
                              name={field.name}
                              value={opt.value}
                              checked={
                                Array.isArray(formValues[field.name])
                                  ? formValues[field.name].includes(opt.value)
                                  : false
                              }
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormValues((prev) => {
                                  if (checked) {
                                    // Only allow one checked at a time
                                    return {
                                      ...prev,
                                      [field.name]: [opt.value],
                                    };
                                  } else {
                                    // Uncheck all if unchecked
                                    return { ...prev, [field.name]: [] };
                                  }
                                });
                              }}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formValues[field.name] || ""}
                        onChange={handleChange}
                        style={{ width: "100%", fontSize: 16 }}
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
            <h2 style={{ color: "#38a1ff", marginBottom: 16 }}>
              Request Submitted
            </h2>
            <p style={{ fontSize: 18, marginBottom: 24 }}>
              Thanks! Your request has been submitted.
              <br />
              We’ll review the details and match you with a local helper as soon
              as we can.
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
      {/* Teen Signup Dialog */}
      {showTeenSignup && (
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
            zIndex: 1200,
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
              maxWidth: 350,
            }}
          >
            {teenSignupSent ? (
              <div style={{ fontSize: 20, color: "#38a1ff", fontWeight: 600 }}>
                Signup submitted! Thank you!
              </div>
            ) : (
              <>
                <h2 style={{ color: "#b71234", marginBottom: 16 }}>
                  Greenwich Teen Signup
                </h2>
                <form onSubmit={handleTeenSubmit}>
                  <div style={{ marginBottom: 16, textAlign: "left" }}>
                    <label style={{ fontWeight: 500 }}>
                      Name
                      <span style={{ color: "#b71234", marginLeft: 4 }}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={teenForm.name}
                      onChange={handleTeenChange}
                      required
                      style={{
                        width: "100%",
                        fontSize: 16,
                        padding: "8px 6px",
                        borderRadius: 6,
                        border: "1px solid #bbb",
                        marginTop: 4,
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 16, textAlign: "left" }}>
                    <label style={{ fontWeight: 500 }}>
                      Phone Number
                      <span style={{ color: "#b71234", marginLeft: 4 }}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={teenForm.phone}
                      onChange={handleTeenChange}
                      required
                      style={{
                        width: "100%",
                        fontSize: 16,
                        padding: "8px 6px",
                        borderRadius: 6,
                        border: "1px solid #bbb",
                        marginTop: 4,
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 16, textAlign: "left" }}>
                    <label style={{ fontWeight: 500 }}>
                      Email
                      <span style={{ color: "#b71234", marginLeft: 4 }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={teenForm.email}
                      onChange={handleTeenChange}
                      required
                      style={{
                        width: "100%",
                        fontSize: 16,
                        padding: "8px 6px",
                        borderRadius: 6,
                        border: "1px solid #bbb",
                        marginTop: 4,
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: 16, textAlign: "left" }}>
                    <label style={{ fontWeight: 500 }}>
                      School
                      <span style={{ color: "#b71234", marginLeft: 4 }}>*</span>
                    </label>
                    <select
                      name="school"
                      value={teenForm.school}
                      onChange={handleTeenChange}
                      required
                      style={{
                        width: "100%",
                        fontSize: 16,
                        padding: "8px 6px",
                        borderRadius: 6,
                        border: "1px solid #bbb",
                        marginTop: 4,
                        background: "#fff",
                        color: teenForm.school ? "#222" : "#888",
                      }}
                    >
                      <option value="" disabled>
                        Select your school
                      </option>
                      <option value="Greenwich High School">
                        Greenwich High School
                      </option>
                      <option value="Eastern Middle School">
                        Eastern Middle School
                      </option>
                      <option value="Western Middle School">
                        Western Middle School
                      </option>
                      <option value="Central Middle School">
                        Central Middle School
                      </option>
                      <option value="Greenwich Academy">
                        Greenwich Academy
                      </option>
                      <option value="King School">King School</option>
                      <option value="Brunswick School">Brunswick School</option>
                      <option value="Sacred Heart Greenwich">
                        Sacred Heart Greenwich
                      </option>
                      <option value="Greenwich Country Day School">
                        Greenwich Country Day School
                      </option>
                      <option value="Other">Other* (specify below)</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 18, textAlign: "left" }}>
                    <label
                      style={{
                        fontWeight: 500,
                        marginBottom: 6,
                        display: "block",
                      }}
                    >
                      What jobs are you interested in?
                    </label>
                    <textarea
                      name="interests"
                      value={teenForm.interests}
                      onChange={handleTeenChange}
                      rows={3}
                      style={{
                        width: "100%",
                        fontSize: 16,
                        padding: "8px 6px",
                        borderRadius: 6,
                        border: "1px solid #bbb",
                        resize: "vertical",
                        marginTop: 4,
                      }}
                      placeholder="Describe the jobs or types of work you're interested in"
                      required
                    />
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 16,
                      justifyContent: "center",
                      marginTop: 18,
                    }}
                  >
                    <button
                      type="submit"
                      style={{
                        background: "#b71234",
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 17,
                        padding: "10px 28px",
                        border: "none",
                        borderRadius: 16,
                        boxShadow: "0 1px 4px rgba(183,18,52,0.10)",
                        cursor: "pointer",
                        transition: "background 0.2s, transform 0.1s",
                      }}
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowTeenSignup(false)}
                      style={{
                        background: "#e6e7e8",
                        color: "#231f20",
                        fontWeight: "bold",
                        fontSize: 17,
                        padding: "10px 28px",
                        border: "none",
                        borderRadius: 16,
                        boxShadow: "0 1px 4px rgba(35,31,32,0.10)",
                        cursor: "pointer",
                        transition: "background 0.2s, transform 0.1s",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

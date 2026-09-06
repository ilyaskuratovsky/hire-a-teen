import React, { useState } from "react";
import { sendEmail } from "./EmailService.js";
import Spinner from "./Spinner.react.js";

const SERVICE_CARDS = [
  {
    title: "Sports Training",
    description: "Improve skills, build confidence, love the game.",
    icon: "basketball",
  },
  {
    title: "Academic Tutoring",
    description: "Homework help, test prep, study skills, and more.",
    icon: "book",
  },
  {
    title: "Babysitting",
    description: "Responsible care from someone your kids like.",
    icon: "people",
  },
  {
    title: "Music & Art",
    description: "Piano, guitar, music theory, art lessons, and more.",
    icon: "music",
  },
];

const REQUEST_FIELDS = [
  {
    name: "name",
    label: "Your name",
    type: "text",
    required: true,
  },
  {
    name: "phone",
    label: "Phone number",
    type: "tel",
    required: true,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    required: true,
  },
  {
    name: "childAge",
    label: "Child's age",
    type: "text",
    required: false,
  },
  {
    name: "interest",
    label: "What kind of mentor are you looking for?",
    type: "select",
    required: true,
    options: [
      "Sports Training",
      "Academic Tutoring",
      "Babysitting",
      "Music & Art",
      "Other",
    ],
  },
  {
    name: "notes",
    label: "Tell me a little about what you're looking for",
    type: "textarea",
    required: false,
  },
];

function Icon({ type, size = 34, stroke = "#0d63f3" }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke,
    strokeWidth: 2.5,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    style: { flexShrink: 0 },
  };

  if (type === "basketball") {
    return (
      <svg {...common}>
        <circle cx="24" cy="24" r="18" />
        <path d="M24 6v36M6 24h36" />
        <path d="M10 12c8 5 20 5 28 0M10 36c8-5 20-5 28 0" />
      </svg>
    );
  }

  if (type === "book") {
    return (
      <svg {...common}>
        <path d="M7 10c7-2 13 0 17 4v26c-4-4-10-6-17-4z" />
        <path d="M41 10c-7-2-13 0-17 4v26c4-4 10-6 17-4z" />
        <path d="M24 14v26" />
      </svg>
    );
  }

  if (type === "people") {
    return (
      <svg {...common}>
        <circle cx="18" cy="17" r="7" />
        <circle cx="32" cy="20" r="5" />
        <path d="M7 39c1-9 6-13 11-13s10 4 11 13" />
        <path d="M28 29c7-2 12 2 13 9" />
      </svg>
    );
  }

  if (type === "music") {
    return (
      <svg {...common}>
        <path d="M20 35V13l18-4v21" />
        <ellipse cx="14" cy="36" rx="6" ry="4" />
        <ellipse cx="32" cy="31" rx="6" ry="4" />
      </svg>
    );
  }

  if (type === "message") {
    return (
      <svg {...common}>
        <path d="M7 9h34v25H20L10 41l2-7H7z" />
      </svg>
    );
  }

  if (type === "email") {
    return (
      <svg {...common}>
        <rect x="5" y="10" width="38" height="28" rx="2" />
        <path d="M6 12l18 14 18-14" />
      </svg>
    );
  }

  if (type === "form") {
    return (
      <svg {...common}>
        <rect x="8" y="5" width="27" height="36" rx="3" />
        <path d="M14 14h14M14 21h10M14 28h8" />
        <path d="M29 35l9-9 4 4-9 9-5 1z" />
      </svg>
    );
  }

  if (type === "star") {
    return (
      <svg {...common}>
        <path d="M24 5l5.8 11.8L43 18.7l-9.5 9.3 2.2 13.1L24 35l-11.7 6.1L14.5 28 5 18.7l13.2-1.9z" />
      </svg>
    );
  }

  return null;
}

function MainMentor({ doNotSend = false }) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    email: "",
    childAge: "",
    interest: "",
    notes: "",
  });

  const openRequestForm = (interest = "") => {
    setShowContactModal(false);

    setFormValues((prev) => ({
      ...prev,
      interest,
    }));

    setShowFormModal(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const jobData = {
      type: formValues.interest || "TeenHelper Mentor Match",
      ...formValues,
      createdAt: new Date(),
    };

    try {
      if (process.env.REACT_APP_SUBMIT_JOB_URL) {
        const response = await fetch(process.env.REACT_APP_SUBMIT_JOB_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(jobData),
        });

        if (!response.ok) {
          throw new Error("Failed to submit request: " + response.statusText);
        }
      }
    } catch (error) {
      console.log("Error submitting request:", error);
    }

    const message = [
      `Name: ${formValues.name}`,
      `Phone: ${formValues.phone}`,
      `Email: ${formValues.email}`,
      `Child's age: ${formValues.childAge}`,
      `Interest: ${formValues.interest}`,
      `Notes: ${formValues.notes}`,
    ].join("\n");

    try {
      if (!doNotSend) {
        await sendEmail({
          type: "TeenHelper Mentor Match",
          message,
          ...formValues,
        });
      }

      setShowFormModal(false);
      setShowConfirmation(true);
    } catch (error) {
      alert(
        "Failed to send request: " +
          JSON.stringify(error) +
          ". Please alert the administrator.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <main style={styles.shell}>
        {/* HEADER */}

        <header style={styles.header}>
          <div style={styles.brand}>
            TeenHelper <span style={styles.brandDivider}>|</span> Greenwich, CT
          </div>
        </header>

        <section style={styles.hero}>
          <h1 style={styles.heroTitle}>
            Greenwich kids.
            <br />
            Great local mentors.
          </h1>

          <div style={styles.serviceBar}>
            <span>• Sports Training</span>
            <span>• Academic Tutoring</span>
            <span>• Babysitting</span>
            <span>• Music & Art</span>
          </div>
        </section>

        {/* SAM */}

        <section style={styles.samSection}>
          <div style={styles.samTopRow}>
            <img
              src="./sam.png"
              alt="Sam, founder of TeenHelper"
              style={styles.samPhoto}
            />

            <div style={styles.samContent}>
              <h2 style={styles.samTitle}>Hi, I’m Sam.</h2>

              <div style={styles.samSubtitle}>
                Greenwich High School student and founder of TeenHelper.
              </div>

              <p style={styles.samText}>
                I personally connect Greenwich families with great local high
                school mentors who teach, coach, babysit, tutor, and more.
              </p>
            </div>
          </div>

          <button
            type="button"
            style={styles.contactButton}
            onClick={() => setShowContactModal(true)}
          >
            Contact
          </button>
        </section>

        {/* SERVICES */}

        <section style={styles.servicesSection}>
          <h2 style={styles.sectionTitle}>How a Teen Helper Can Help</h2>

          <div style={styles.serviceGrid}>
            {SERVICE_CARDS.map((service) => (
              <button
                key={service.title}
                type="button"
                style={styles.serviceCard}
                onClick={() => openRequestForm(service.title)}
              >
                <Icon type={service.icon} size={40} />

                <div style={styles.serviceCardText}>
                  <div style={styles.serviceTitle}>{service.title}</div>

                  <div style={styles.serviceDescription}>
                    {service.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div style={styles.divider} />

        {/* CONTACT */}

        <section>
          <h2 style={styles.sectionTitle}>Ways to Get in Touch</h2>

          <div style={styles.mobileContactList}>
            <a href="tel:+12039121799" style={styles.mobileContactRow}>
              <div style={styles.contactLeft}>
                <Icon type="message" size={32} />

                <div>
                  <div style={styles.contactTitle}>Text or Call</div>

                  <div style={styles.contactLink}>(203) 912-1799</div>
                </div>
              </div>

              <div style={styles.chevron}>›</div>
            </a>

            <a
              href="mailto:greenwichhireateen@gmail.com"
              style={styles.mobileContactRow}
            >
              <div style={styles.contactLeft}>
                <Icon type="email" size={32} />

                <div>
                  <div style={styles.contactTitle}>Email</div>

                  <div style={styles.contactLink}>
                    greenwichhireateen@gmail.com
                  </div>
                </div>
              </div>

              <div style={styles.chevron}>›</div>
            </a>

            <button
              type="button"
              style={styles.mobileContactButton}
              onClick={() => openRequestForm("")}
            >
              <div style={styles.contactLeft}>
                <Icon type="form" size={32} />

                <div style={{ textAlign: "left" }}>
                  <div style={styles.contactTitle}>Fill Out the Form</div>

                  <div style={styles.contactSubtext}>I’ll be in touch!</div>
                </div>
              </div>

              <div style={styles.chevron}>›</div>
            </button>
          </div>
        </section>

        {/* PRICE */}

        <section style={styles.matchBox}>
          <Icon type="star" size={48} stroke="#f2a900" />

          <div>
            <div style={styles.priceHeadline}>
              The service costs <strong style={styles.price}>$50</strong>.
            </div>

            <div style={styles.matchText}>
              I’ll personally work with you to understand what your child is
              looking for and match them with the right mentor from my local
              Greenwich network.
            </div>
          </div>
        </section>
      </main>

      {/* CONTACT MODAL */}

      {showContactModal && (
        <div style={styles.overlay} onClick={() => setShowContactModal(false)}>
          <div style={styles.contactModal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowContactModal(false)}
              style={styles.closeButton}
            >
              ×
            </button>

            <div style={styles.contactModalHeader}>
              <img src="./sam.png" alt="Sam" style={styles.modalSamPhoto} />

              <div>
                <h2 style={styles.modalTitle}>Contact Sam</h2>

                <div style={styles.modalIntroSmall}>
                  Tell me what kind of mentor you're looking for.
                </div>
              </div>
            </div>

            <div style={styles.contactChoices}>
              <a href="tel:+12039121799" style={styles.contactChoice}>
                <Icon type="message" size={34} />

                <div>
                  <div style={styles.choiceTitle}>Text or Call</div>

                  <div style={styles.choiceLink}>(203) 912-1799</div>
                </div>
              </a>

              <a
                href="mailto:greenwichhireateen@gmail.com"
                style={styles.contactChoice}
              >
                <Icon type="email" size={34} />

                <div>
                  <div style={styles.choiceTitle}>Email</div>

                  <div style={styles.choiceLink}>
                    greenwichhireateen@gmail.com
                  </div>
                </div>
              </a>

              <button
                type="button"
                style={styles.contactChoiceButton}
                onClick={() => openRequestForm("")}
              >
                <Icon type="form" size={34} />

                <div style={{ textAlign: "left" }}>
                  <div style={styles.choiceTitle}>Fill Out the Form</div>

                  <div style={styles.choiceSubtext}>
                    Tell me what you're looking for
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUEST FORM */}

      {showFormModal && (
        <div style={styles.overlay} onClick={() => setShowFormModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            {submitting && (
              <div style={styles.spinnerOverlay}>
                <Spinner size={40} color="#0d63f3" />
              </div>
            )}

            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowFormModal(false)}
              style={styles.closeButton}
            >
              ×
            </button>

            <h2 style={styles.modalTitle}>Find a Teen Helper</h2>

            <p style={styles.modalIntro}>
              Tell me about your child and what you're looking for. I’ll help
              find a strong local match.
            </p>

            <form onSubmit={handleSubmit}>
              {REQUEST_FIELDS.map((field) => (
                <label key={field.name} style={styles.fieldLabel}>
                  <span style={styles.fieldLabelText}>
                    {field.label}

                    {field.required && <span style={styles.required}> *</span>}
                  </span>

                  {field.type === "select" ? (
                    <select
                      name={field.name}
                      value={formValues[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      style={styles.input}
                    >
                      <option value="">Select an option</option>

                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      name={field.name}
                      value={formValues[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      rows={4}
                      style={{
                        ...styles.input,
                        resize: "vertical",
                      }}
                    />
                  ) : (
                    <input
                      type={field.type}
                      name={field.name}
                      value={formValues[field.name]}
                      onChange={handleChange}
                      required={field.required}
                      style={styles.input}
                    />
                  )}
                </label>
              ))}

              <div style={styles.modalActions}>
                <button type="submit" style={styles.submitButton}>
                  Submit
                </button>

                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  style={styles.cancelButton}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION */}

      {showConfirmation && (
        <div style={styles.overlay} onClick={() => setShowConfirmation(false)}>
          <div
            style={{
              ...styles.modal,
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={styles.modalTitle}>Request Submitted</h2>

            <p style={styles.modalIntro}>
              Thanks! I’ll review what you’re looking for and get in touch about
              a local mentor who could be a good fit.
            </p>

            <button
              type="button"
              onClick={() => setShowConfirmation(false)}
              style={styles.submitButton}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#ffffff",
    color: "#071632",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  shell: {
    width: "min(100% - 20px, 560px)",
    margin: "0 auto",
    padding: "15px 0 26px",
  },

  header: {
    textAlign: "center",
  },

  brand: {
    color: "#0d63f3",
    fontWeight: 800,
    fontSize: "clamp(24px, 7vw, 34px)",
    letterSpacing: "-0.8px",
    lineHeight: 1.06,
  },

  brandDivider: {
    fontWeight: 500,
  },

  tagline: {
    marginTop: 1,
    color: "#536078",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: 1.15,
  },

  hero: {
    textAlign: "center",
  },

  heroTitle: {
    margin: "9px 0 9px",
    color: "#061530",
    fontSize: "clamp(32px, 8.5vw, 42px)",
    lineHeight: 1.01,
    letterSpacing: "-1.5px",
    fontWeight: 850,
  },

  serviceBar: {
    borderTop: "1px solid #d7deea",
    borderBottom: "1px solid #d7deea",
    padding: "7px 2px",
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "4px 12px",
    fontSize: 11.5,
    color: "#253551",
    lineHeight: 1.2,
  },

  samSection: {
    margin: "19px 0 21px",
  },

  samTopRow: {
    display: "grid",
    gridTemplateColumns: "96px 1fr",
    gap: 14,
    alignItems: "center",
  },

  samPhoto: {
    width: 96,
    height: 96,
    borderRadius: "50%",
    objectFit: "cover",
  },

  samContent: {
    minWidth: 0,
  },

  samTitle: {
    margin: 0,
    color: "#0d63f3",
    fontSize: 23,
    fontWeight: 800,
    letterSpacing: "-0.4px",
    lineHeight: 1.05,
  },

  samSubtitle: {
    marginTop: 2,
    color: "#263650",
    fontWeight: 600,
    fontSize: 12.5,
    lineHeight: 1.28,
  },

  samText: {
    margin: "6px 0 0",
    color: "#263650",
    fontSize: 12.5,
    lineHeight: 1.34,
  },

  contactButton: {
    display: "block",
    width: "72%",
    maxWidth: 240,
    margin: "10px auto 0",
    padding: "10px 16px",
    border: "none",
    borderRadius: 9,
    background: "#f97316",
    color: "#ffffff",
    fontWeight: 800,
    fontSize: 16,
    lineHeight: 1.15,
    cursor: "pointer",
  },

  servicesSection: {
    marginTop: 0,
  },

  sectionTitle: {
    margin: "0 0 10px",
    textAlign: "center",
    color: "#071632",
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: "-0.5px",
    lineHeight: 1.12,
  },

  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 8,
  },

  serviceCard: {
    appearance: "none",
    minHeight: 88,
    border: "1px solid #dce3ee",
    borderRadius: 11,
    background: "#ffffff",
    padding: "10px 9px",
    color: "inherit",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    textAlign: "left",
    gap: 9,
    boxSizing: "border-box",
    boxShadow: "0 1px 2px rgba(16,24,40,0.02)",
  },

  serviceCardText: {
    minWidth: 0,
    flex: 1,
  },

  serviceTitle: {
    color: "#0d63f3",
    fontWeight: 800,
    fontSize: 13.5,
    lineHeight: 1.15,
  },

  serviceDescription: {
    marginTop: 4,
    color: "#121827",
    fontSize: 10.8,
    lineHeight: 1.3,
  },

  divider: {
    height: 1,
    background: "#d5dce7",
    margin: "18px 0",
  },

  mobileContactList: {
    display: "grid",
    gap: 6,
  },

  mobileContactRow: {
    minHeight: 57,
    padding: "9px 13px",
    border: "1px solid #dce3ee",
    borderRadius: 10,
    background: "#ffffff",
    color: "inherit",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    boxSizing: "border-box",
  },

  mobileContactButton: {
    width: "100%",
    minHeight: 57,
    padding: "9px 13px",
    border: "1px solid #dce3ee",
    borderRadius: 10,
    background: "#ffffff",
    color: "inherit",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    cursor: "pointer",
    font: "inherit",
    boxSizing: "border-box",
  },

  contactLeft: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    minWidth: 0,
  },

  contactTitle: {
    color: "#071632",
    fontWeight: 800,
    fontSize: 14.5,
    lineHeight: 1.1,
  },

  contactLink: {
    color: "#0d63f3",
    marginTop: 2,
    fontSize: 12.5,
    overflowWrap: "anywhere",
    lineHeight: 1.15,
  },

  contactSubtext: {
    marginTop: 2,
    color: "#536078",
    fontSize: 12,
    lineHeight: 1.15,
  },

  chevron: {
    color: "#66758c",
    fontSize: 23,
    lineHeight: 1,
  },

  matchBox: {
    marginTop: 18,
    padding: "14px 14px",
    border: "1.5px solid #f2b233",
    borderRadius: 10,
    background:
      "linear-gradient(90deg, rgba(255,250,233,0.95), rgba(255,253,245,0.98))",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  priceHeadline: {
    color: "#071632",
    fontWeight: 800,
    fontSize: 16.5,
    lineHeight: 1.15,
  },

  price: {
    color: "#11953d",
    fontSize: "1.3em",
  },

  matchText: {
    marginTop: 3,
    color: "#101827",
    fontSize: 12.8,
    lineHeight: 1.32,
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(4,14,32,0.58)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: 460,
    maxHeight: "92vh",
    overflowY: "auto",
    background: "#ffffff",
    borderRadius: 16,
    padding: 22,
    boxSizing: "border-box",
    boxShadow: "0 20px 60px rgba(0,0,0,.22)",
    position: "relative",
  },

  contactModal: {
    width: "100%",
    maxWidth: 460,
    background: "#ffffff",
    borderRadius: 16,
    padding: 22,
    boxSizing: "border-box",
    boxShadow: "0 20px 60px rgba(0,0,0,.22)",
    position: "relative",
  },

  contactModalHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },

  modalSamPhoto: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    objectFit: "cover",
  },

  contactChoices: {
    display: "grid",
    gap: 8,
  },

  contactChoice: {
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: "13px 14px",
    border: "1px solid #dce3ee",
    borderRadius: 11,
    textDecoration: "none",
    color: "#071632",
  },

  contactChoiceButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 13,
    padding: "13px 14px",
    border: "1px solid #dce3ee",
    borderRadius: 11,
    background: "#ffffff",
    color: "#071632",
    font: "inherit",
    cursor: "pointer",
    boxSizing: "border-box",
  },

  choiceTitle: {
    fontWeight: 800,
    fontSize: 15,
  },

  choiceLink: {
    marginTop: 2,
    color: "#0d63f3",
    fontSize: 13,
    overflowWrap: "anywhere",
  },

  choiceSubtext: {
    marginTop: 2,
    color: "#536078",
    fontSize: 12.5,
  },

  closeButton: {
    position: "absolute",
    right: 12,
    top: 8,
    border: 0,
    background: "transparent",
    fontSize: 26,
    color: "#67748b",
    cursor: "pointer",
  },

  modalTitle: {
    margin: "0 0 5px",
    color: "#0d63f3",
    fontSize: 23,
  },

  modalIntroSmall: {
    color: "#536078",
    fontSize: 13,
    lineHeight: 1.35,
  },

  modalIntro: {
    margin: "0 0 18px",
    color: "#536078",
    fontSize: 14,
    lineHeight: 1.45,
  },

  spinnerOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,.76)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
    borderRadius: 16,
  },

  fieldLabel: {
    display: "block",
    marginBottom: 12,
  },

  fieldLabelText: {
    display: "block",
    marginBottom: 4,
    fontSize: 13.5,
    fontWeight: 700,
    color: "#19243a",
  },

  required: {
    color: "#d83d3d",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd4e1",
    borderRadius: 8,
    padding: "10px 11px",
    fontSize: 16,
    fontFamily: "inherit",
    background: "#ffffff",
  },

  modalActions: {
    display: "flex",
    gap: 9,
    justifyContent: "center",
    marginTop: 18,
  },

  submitButton: {
    background: "#0d63f3",
    color: "#ffffff",
    border: 0,
    borderRadius: 999,
    padding: "10px 22px",
    fontWeight: 800,
    fontSize: 15,
    cursor: "pointer",
  },

  cancelButton: {
    background: "#eef2f7",
    color: "#26354f",
    border: 0,
    borderRadius: 999,
    padding: "10px 22px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
};

export default MainMentor;

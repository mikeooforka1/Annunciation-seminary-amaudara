import React, { useState } from 'react';
import Image from '../components/AppImage';
import Icon from '../components/AppIcon';

const ContactPage = () => {
  // --- Contact form state and handlers ---
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSent(false);
    console.log("[Contact] Submitting support form:", form);
    try {
      const res = await fetch(`${API_BASE_URL}/api/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      console.log("[Contact] Server response:", data);
      if (res.ok && data.success) {
        setSent(true);
        setForm({ name: "", email: "", message: "", responseEmail: "" });
      } else {
        setError(data.message || "Failed to send message.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("[Contact] Network error:", err);
    }
    setLoading(false);
  };
  // --- End contact form state and handlers ---

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl shadow-lg p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-4 rounded-full overflow-hidden border-4 border-primary/20">
              <Image 
                src="/assets/images/school_logo-1754996036714.jpg"
                alt="ANNUNCIATION SEMINARY AMAUDARA Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-heading font-bold text-primary mb-2">Contact Info</h1>
            <p className="text-muted-foreground text-center">
              Reach out to us for inquiries, support, or more information about ANNUNCIATION SEMINARY AMAUDARA.<br />
              We are always happy to hear from you and will respond as soon as possible.<br />
              For urgent matters, please use the phone numbers below.
            </p>
          </div>
          <ul className="space-y-4 font-body text-base text-foreground mb-8">
            <li className="flex items-center space-x-3">
              <Icon name="MapPin" size={20} />
              <span>Isiala Ngwa South, Abia State</span>
            </li>
            <li>
              <span className="font-semibold text-primary">For School-Related Issues:</span>
              <ul className="ml-4 mt-1 space-y-1 text-sm">
                <li className="flex items-center space-x-2">
                  <Icon name="Phone" size={18} />
                  <span>
                    <a
                      href="/call?number=+2347069386013"
                      className="underline text-primary hover:text-primary/80 transition"
                    >
                      +2347069386013
                    </a>
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Briefcase" size={18} />
                  <span>
                    <a
                      href="/call?number=+2348039360904"
                      className="underline text-primary hover:text-primary/80 transition"
                    >
                      +2348039360904
                    </a>
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Mail" size={18} />
                  <span>annunciationseminaryamaudara84@gmail.com</span>
                </li>
              </ul>
            </li>
            <li>
              <span className="font-semibold text-primary">For Website/Technical Issues:</span>
              <ul className="ml-4 mt-1 space-y-1 text-sm mb-4">
                <li className="flex items-center space-x-2">
                  <Icon name="Smartphone" size={18} />
                  <span>
                    WhatsApp: <a href="https://wa.me/2348143316441" className="underline text-primary">+2348143316441</a>
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <Icon name="Phone" size={18} />
                  <span>
                    <a
                      href="/call?number=+2349040744911"
                      className="underline text-primary hover:text-primary/80 transition"
                    >
                      Call: +2349040744911
                    </a>
                  </span>
                </li>
              </ul>
              {/* Contact Form */}
              <form className="mt-4 grid gap-4 bg-muted/10 border border-border rounded-xl p-4" onSubmit={handleSubmit}>
                <div className="font-semibold mb-2 text-primary">Send a message to technical support:</div>
                <div className="text-sm text-muted-foreground mb-2 font-semibold">
                  Please describe your issues very well and go straight to the point.<br />
                  When you send us a message, an expert will attend to your request within 30 minutes.
                </div>
                <input
                  name="name"
                  className="rounded-xl bg-background border border-border px-4 py-3 outline-none text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary"
                  placeholder="Student name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
                <div className="text-xs text-muted-foreground font-semibold -mt-3 mb-2">
                  Enter the full name of the student.
                </div>
                <input
                  name="email"
                  className="rounded-xl bg-background border border-border px-4 py-3 outline-none text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary"
                  placeholder="Student's class"
                  type="text"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <div className="text-xs text-muted-foreground font-semibold -mt-3 mb-2">
                  Enter the current class of the student (e.g., JSS1, SS2).
                </div>
                <input
                  name="responseEmail"
                  className="rounded-xl bg-background border border-border px-4 py-3 outline-none text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary"
                  placeholder="Email to receive response"
                  type="email"
                  value={form.responseEmail || ""}
                  onChange={handleChange}
                  required
                />
                <div className="text-xs text-muted-foreground font-semibold -mt-3 mb-2">
                  Enter a valid email address where you want to receive our response.
                </div>
                <textarea
                  name="message"
                  className="rounded-xl bg-background border border-border px-4 py-3 h-32 outline-none text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary"
                  placeholder="Describe your issue"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
                <div className="text-xs text-muted-foreground font-semibold -mt-3 mb-2">
                  Clearly describe the issue you are facing.
                </div>
                <button
                  className="rounded-xl px-5 py-3 font-semibold bg-gradient-to-r from-primary via-secondary to-primary text-white w-fit shadow hover:from-secondary hover:to-primary"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send message"}
                </button>
                {sent && (
                  <div className="mt-2 text-emerald-600 font-semibold">
                    Message sent successfully.<br />
                    An expert will attend to your request within 20/30 minutes.
                  </div>
                )}
                {error && (
                  <div className="mt-2 text-error font-semibold">{error}</div>
                )}
              </form>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
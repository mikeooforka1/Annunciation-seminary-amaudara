import React, { useState } from 'react';
import Image from '../components/AppImage';
import Icon from '../components/AppIcon';

const ContactPage = () => {
  // --- Contact form state and handlers ---
  const [form, setForm] = useState({ name: "", studentClass: "", message: "", responseEmail: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSent(false);

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          access_key: "311536cc-14af-482a-b3f4-35a71da5c70c",
          subject: `Technical Support Request from ${form.name} (${form.studentClass})`,
          from_name: form.name,
          name: form.name,
          student_class: form.studentClass,
          email: form.responseEmail,
          message: form.message
        })
      });

      const data = await response.json();

      if (data.success) {
        setSent(true);
        setForm({ name: "", studentClass: "", message: "", responseEmail: "" });
      } else {
        setError(data.message || "Failed to send message. Please try again.");
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error("[Contact] Submission error:", err);
    } finally {
      setLoading(false);
    }
  };
  // --- End contact form state and handlers ---

  return (
    <div className="min-h-screen bg-background py-10 md:py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
          
          {/* Header Section */}
          <div className="p-6 md:p-10 border-b border-border text-center bg-muted/20">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary/20 shadow-md">
              <Image 
                src="/assets/images/school_logo-1754996036714.jpg"
                alt="ANNUNCIATION SEMINARY AMAUDARA Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-3">
              Contact & Support
            </h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Reach out to us for inquiries, support, or more information about ANNUNCIATION SEMINARY AMAUDARA. We are always happy to hear from you. For urgent matters, please use the direct phone lines below.
            </p>
          </div>

          <div className="p-6 md:p-10 space-y-8">
            
            {/* Location Pill */}
            <div className="flex items-center justify-center sm:justify-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                <Icon name="MapPin" size={20} />
              </div>
              <span className="text-sm md:text-base font-medium text-foreground">
                Isiala Ngwa South, Abia State
              </span>
            </div>

            {/* School Related Enquiries */}
            <div className="p-5 md:p-6 rounded-xl bg-card border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Briefcase" size={20} className="text-primary" />
                <h2 className="font-heading font-bold text-base md:text-lg text-foreground">
                  For School-Related Issues
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <a
                  href="/call?number=+2347069386013"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/80 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <Icon name="Phone" size={16} className="text-primary" />
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    +234 706 938 6013
                  </span>
                </a>
                <a
                  href="/call?number=+2348039360904"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/80 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <Icon name="Phone" size={16} className="text-primary" />
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    +234 803 936 0904
                  </span>
                </a>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border/80 sm:col-span-2">
                  <Icon name="Mail" size={16} className="text-primary flex-shrink-0" />
                  <span className="text-muted-foreground break-all">
                    annunciationseminaryamaudara84@gmail.com
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Support Section */}
            <div className="p-5 md:p-6 rounded-xl bg-card border border-border shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Smartphone" size={20} className="text-primary" />
                <h2 className="font-heading font-bold text-base md:text-lg text-foreground">
                  For Website & Technical Support
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-6">
                <a
                  href="https://wa.me/2348143316441"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/80 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <Icon name="MessageSquare" size={16} className="text-primary" />
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    WhatsApp: +234 814 331 6441
                  </span>
                </a>
                <a
                  href="/call?number=+2349040744911"
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/80 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <Icon name="Phone" size={16} className="text-primary" />
                  <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                    Call: +234 904 074 4911
                  </span>
                </a>
              </div>

              {/* Support Form */}
              <form 
                className="p-5 md:p-6 bg-muted/30 border border-border/80 rounded-xl space-y-4" 
                onSubmit={handleSubmit}
              >
                <div>
                  <h3 className="font-heading font-bold text-base text-foreground mb-1">
                    Send a Message to Technical Support
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    Please describe your issues clearly and go straight to the point. An expert will attend to your request within 20–30 minutes.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Student Name
                  </label>
                  <input
                    name="name"
                    className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-sm outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="Enter student's full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the full registered name of the student.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Student's Class
                  </label>
                  <input
                    name="studentClass"
                    className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-sm outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., JSS1, SS2"
                    type="text"
                    value={form.studentClass}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    inputMode="text"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the current academic class of the student.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Response Email
                  </label>
                  <input
                    name="responseEmail"
                    className="w-full rounded-lg bg-background border border-border px-4 py-2.5 text-sm outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="name@example.com"
                    type="email"
                    value={form.responseEmail}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a valid email address where you will receive a response.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Issue Description
                  </label>
                  <textarea
                    name="message"
                    className="w-full rounded-lg bg-background border border-border px-4 py-2.5 h-32 text-sm outline-none text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                    placeholder="Describe the issue you are encountering..."
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Clearly describe the problem or error you are facing.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-primary text-primary-foreground shadow hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <Icon name="Send" size={16} />
                  <span>{loading ? "Sending..." : "Send Message"}</span>
                </button>

                {sent && (
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-medium">
                    Message sent successfully. An expert will attend to your request within 20–30 minutes.
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                    {error}
                  </div>
                )}
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
"use client";

import { useState, FormEvent } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear email error when user starts typing
    if (name === "email" && errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(formData.email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsSubmitting(true);
    setShowSuccess(false);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowSuccess(true);
        setFormData({ name: "", email: "", message: "" });
        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="mt-16 flex w-full flex-col items-center bg-white px-4 py-10 lg:px-14 lg:py-[120px]">
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-10">
        {/* Title */}
        <h1
          className="text-[40px] font-semibold leading-normal text-black"
          style={{ fontFamily: "var(--font-brand)" }}
        >
          Contact us
        </h1>

        {/* Form Container */}
        <div className="w-full max-w-[480px] rounded-[24px] bg-[#f4f4f5] p-6 lg:p-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            {/* Name and Email Row */}
            <div className="flex flex-col gap-6 lg:flex-row lg:gap-6">
              {/* Name Input */}
              <div className="flex flex-1 flex-col gap-2">
                <label
                  htmlFor="name"
                  className="text-base font-bold leading-6 text-black"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  className="h-12 rounded-xl bg-white px-3 py-3 text-base leading-6 text-black placeholder-[#a6a6ac] focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              {/* Email Input */}
              <div className="flex flex-1 flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-base font-bold leading-6 text-black"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email"
                  required
                  className={`h-12 rounded-xl bg-white px-3 py-3 text-base leading-6 text-black placeholder-[#a6a6ac] focus:outline-none focus:ring-2 ${
                    errors.email ? "ring-2 ring-red-500" : "focus:ring-black"
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Message Input */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="message"
                className="text-base font-bold leading-6 text-black"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message"
                required
                rows={6}
                className="rounded-xl bg-white px-3 py-3 text-base leading-6 text-black placeholder-[#a6a6ac] focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Submit Button and Success Message Container */}
            <div className="flex flex-col gap-4">
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-2xl bg-black px-4 py-4 text-base font-bold leading-6 text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Submit"}
              </button>

              {/* Success Notification */}
              {showSuccess && (
                <div className="flex items-start gap-2 rounded-lg bg-[rgba(64,227,0,0.1)] p-2">
                  <div className="flex h-5 w-5 items-center justify-center">
                    <svg
                      width="15"
                      height="12"
                      viewBox="0 0 15 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1.5 6L5.5 10L13.5 1.5"
                        stroke="#007d23"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-sm font-medium leading-[21px] text-[#007d23]">
                    Thank you! Your message has been sent.
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

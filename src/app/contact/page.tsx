import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with PrepIt. We're here to help with your questions about meal planning, nutrition tracking, and our AI-powered app features.",
  openGraph: {
    title: "Contact Us | PrepIt",
    description:
      "Get in touch with PrepIt. We're here to help with your questions about meal planning and nutrition tracking.",
    url: "/contact",
  },
  twitter: {
    card: "summary",
    title: "Contact Us | PrepIt",
    description:
      "Get in touch with PrepIt. We're here to help with your questions about meal planning and nutrition tracking.",
  },
};

export default function ContactPage() {
  return <ContactForm />;
}

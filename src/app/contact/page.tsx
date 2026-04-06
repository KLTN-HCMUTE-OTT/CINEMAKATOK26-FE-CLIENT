import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import ContactForm from "@/components/contact-form";
import ContactInfo from "@/components/contact-info";

export const metadata = {
  title: "Contact | My App",
  description: "Contact page description",
};
export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-red-600">
      <Header />
      <ContactForm />
      <ContactInfo />
      <Footer />
    </div>
  );
}

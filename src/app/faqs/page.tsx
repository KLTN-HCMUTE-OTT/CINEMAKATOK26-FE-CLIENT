import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import FAQ from "@/components/faq";

export const metadata = {
  title: "FAQs | My App",
  description: "FAQs page description",
};
export default function FAQSPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-red-600">
      <Header />
      <FAQ />
      <Footer />
    </div>
  );
}

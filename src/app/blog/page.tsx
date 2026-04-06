import { BlogBanner } from "@/components/blog/blog-banner";
import { BlogCardList } from "@/components/blog/blog-card";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

export const metadata = {
  title: "Blog | My App",
  description: "Blog page description",
};
export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      <Header variant="fixed" />
      <div>
        <div className="pt-12">
          <BlogBanner />
          <BlogCardList />
        </div>
      </div>

      <Footer />
    </div>
  );
}

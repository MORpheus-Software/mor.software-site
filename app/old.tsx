import { Main } from "@/components/Main";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Main Page
// ========================================================
export default function Home() {
  // Render
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow  sm:p-8">
        <Main />
      </main>
      <Footer />
    </div>
  );
}

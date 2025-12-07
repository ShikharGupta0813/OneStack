import { Hero } from "../components/Hero";
import { Features } from "../components/Features";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="bg-slate-950 min-h-screen">
      <Header />
      <Hero onStart={() => navigate("/upload")} />
      <Features />
      <Footer />
    </div>
  );
}

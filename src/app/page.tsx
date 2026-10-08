import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Work from "@/components/sections/Work";
import Skills from "@/components/sections/Skills";
import Timeline from "@/components/sections/Timeline";
import Education from "@/components/sections/Education";
import Certifications from "@/components/sections/Certifications";
import Resume from "@/components/sections/Resume";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <About />
      <Work />
      <Skills />
      <Timeline />
      <Education />
      <Certifications />
      <Resume />
      <Contact />
      <Footer />
    </main>
  );
}

import Hero from "./_components/sections/Hero";
import TrustBar from "./_components/sections/TrustBar";
import Problem from "./_components/sections/Problem";
import Features from "./_components/sections/Features";
import HowItWorks from "./_components/sections/HowItWorks";
import Integrations from "./_components/sections/Integrations";
import Metrics from "./_components/sections/Metrics";
import Testimonials from "./_components/sections/Testimonials";
import FinalCTA from "./_components/sections/FinalCTA";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Problem />
      <Features />
      <HowItWorks />
      <Integrations />
      <Metrics />
      <Testimonials />
      <FinalCTA />
    </>
  );
}

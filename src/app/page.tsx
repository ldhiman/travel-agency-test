import HeroSection from "./components/HeroSection";
import ReviewSection from "./components/ReviewSection";
import ViewsSection from "./components/ViewsSection";
import OurServices from "./components/OurServices";
import InfoSection from "./components/InfoSection";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ViewsSection />
      <ReviewSection />
      <OurServices />
      <InfoSection />
    </div>
  );
}

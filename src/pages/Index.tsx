import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import FeaturedCompanies from "@/components/FeaturedCompanies";
import FeaturedSurveys from "@/components/FeaturedSurveys";
import LatestReviewsCarousel from "@/components/LatestReviewsCarousel";
import Categories from "@/components/Categories";
import HowItWorks from "@/components/HowItWorks";
import BusinessCTA from "@/components/BusinessCTA";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import TrustIndicators from "@/components/TrustIndicators";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <TrustIndicators />
        <FeaturedCompanies />
        <LatestReviewsCarousel />
        <FeaturedSurveys />
        <Categories />
        <HowItWorks />
        <BusinessCTA />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

import React from "react";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Stethoscope } from "lucide-react";

/**
 * @component Health
 * @description An informational page that provides details about the health and care of the puppies.
 * It includes a hero section and cards highlighting key health-related features like screenings,
 * vaccinations, and a health guarantee.
 *
 * @returns {JSX.Element} The rendered health and care page.
 */
const Health = () => {
  return (
    <>
      <HeroSection
        title="Health & Care"
        subtitle="Comprehensive health information and care guidelines for your puppy"
        imageSrc="https://images.unsplash.com/photo-1559827260-dc66d52bef19"
        ctaText="Contact Us"
        ctaLink="/contact"
      />
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-accent" />
                Health Screening
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>All our puppies undergo comprehensive health screenings.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="mr-2 h-5 w-5 text-primary" />
                Vaccination Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>Our puppies receive age-appropriate vaccinations.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-accent" />
                Health Guarantee
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>2-year genetic health guarantee included.</p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
};

export default Health;
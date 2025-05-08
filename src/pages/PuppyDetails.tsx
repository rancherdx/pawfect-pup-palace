
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Section from "@/components/Section";
import PuppyImageCarousel from "@/components/puppy-details/PuppyImageCarousel";
import PuppyInfoSection from "@/components/puppy-details/PuppyInfoSection";
import TemperamentTraitsCard from "@/components/puppy-details/TemperamentTraitsCard";
import DetailsTabs from "@/components/puppy-details/DetailsTabs";

// Mock data for puppy details
const puppiesData = [
  {
    id: "1",
    name: "Bella",
    breed: "Golden Retriever",
    age: "8 weeks",
    gender: "Female",
    images: [
      "https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
      "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=736&q=80",
      "https://images.unsplash.com/photo-1652531661755-f234b7fda163?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
    ],
    price: 1200,
    available: true,
    status: "Available",
    description: "Bella is a beautiful Golden Retriever puppy with a playful personality. She loves to cuddle and play fetch. She's well-socialized with children and other pets.",
    parents: {
      dad: {
        name: "Max",
        age: "3 years",
        weight: "70 lbs",
        image: "https://images.unsplash.com/photo-1565708097881-9300cc0f2997?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
      },
      mom: {
        name: "Lucy",
        age: "2 years",
        weight: "65 lbs",
        image: "https://images.unsplash.com/photo-1611250282006-4484dd3fba6f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
      }
    },
    birthDate: "March 15, 2023",
    weight: "7 lbs",
    color: "Golden",
    vaccinations: "First round completed",
    microchipped: true,
    temperament: ["Friendly", "Playful", "Gentle"],
    trainability: 80,
    activityLevel: 70,
    sizeMaturity: "Large",
    feedingNotes: "3 meals daily of high-quality puppy food",
    careTips: [
      "Regular grooming required",
      "Daily exercise needed",
      "Socialization important at this age"
    ],
    lastCheckup: "April 10, 2023",
    growthProgress: 15
  },
  // Add more puppies as needed...
];

// Calculate age in a fun way 
const calculateAge = (birthdayStr: string) => {
  const birthday = new Date(birthdayStr);
  const today = new Date();
  
  // Calculate the time difference in milliseconds
  const diffTime = Math.abs(today.getTime() - birthday.getTime());
  
  // Calculate years, months, weeks
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
  const diffWeeks = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24 * 7));
  
  let ageDisplay = "";
  
  if (diffYears > 0) {
    ageDisplay += `${diffYears} year${diffYears > 1 ? 's' : ''}`;
    if (diffMonths > 0) {
      ageDisplay += ` ${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    }
  } else if (diffMonths > 0) {
    ageDisplay += `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    if (diffWeeks > 0) {
      ageDisplay += ` ${diffWeeks} week${diffWeeks > 1 ? 's' : ''}`;
    }
  } else {
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    ageDisplay = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
  
  return ageDisplay;
};

const PuppyDetails = () => {
  const { id } = useParams();
  
  // Find the puppy based on the ID from the URL
  const puppy = puppiesData.find(p => p.id === id);

  // If puppy is not found, show a message
  if (!puppy) {
    return (
      <Section>
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold mb-4">Puppy Not Found</h1>
          <p className="mb-6">Sorry, we couldn't find the puppy you're looking for.</p>
          <Button asChild>
            <Link to="/puppies">View All Puppies</Link>
          </Button>
        </div>
      </Section>
    );
  }

  // Calculate the puppy's actual age
  const puppyAge = calculateAge(puppy.birthDate);

  return (
    <div className="bg-background/50 relative">
      <div className="absolute inset-0 paw-print-bg opacity-5 pointer-events-none"></div>
      
      <Section>
        <div className="max-w-7xl mx-auto">
          {/* Puppy Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Puppy Images Carousel */}
            <PuppyImageCarousel images={puppy.images} name={puppy.name} />

            {/* Puppy Info */}
            <PuppyInfoSection puppy={puppy} puppyAge={puppyAge} />
          </div>

          {/* Temperament & Traits Card */}
          <div className="mt-8 mb-12">
            <TemperamentTraitsCard 
              temperament={puppy.temperament}
              trainability={puppy.trainability}
              activityLevel={puppy.activityLevel}
            />
          </div>

          {/* Tabs for Additional Information */}
          <div className="mt-8">
            <DetailsTabs puppy={puppy} />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default PuppyDetails;

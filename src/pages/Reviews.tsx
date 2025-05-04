
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Label } from "@/components/ui/label";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import TestimonialCard from "@/components/TestimonialCard";

// Mock testimonials data
const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    location: "New York, NY",
    testimonial: "We adopted Bella three months ago and she has brought so much joy to our family. GDS Puppies was professional and caring throughout the entire process.",
    rating: 5,
    imageSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=688&q=80",
    puppyName: "Bella (Golden Retriever)",
  },
  {
    id: 2,
    name: "Mark Wilson",
    location: "Austin, TX",
    testimonial: "Max is healthy, well-socialized, and everything we could have hoped for. The health guarantee gave us peace of mind with our new addition.",
    rating: 5,
    imageSrc: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    puppyName: "Max (German Shepherd)",
  },
  {
    id: 3,
    name: "Jennifer Lopez",
    location: "Miami, FL",
    testimonial: "The process was smooth from start to finish. Luna is a wonderful addition to our family and the ongoing support from GDS has been amazing.",
    rating: 4,
    imageSrc: "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=880&q=80",
    puppyName: "Luna (Labrador Retriever)",
  },
  {
    id: 4,
    name: "Michael Brown",
    location: "Chicago, IL",
    testimonial: "We couldn't be happier with our decision to adopt from GDS Puppies. Charlie was already well-adjusted and it was clear he had been raised in a loving environment.",
    rating: 5,
    imageSrc: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    puppyName: "Charlie (Beagle)",
  },
  {
    id: 5,
    name: "Emma Davis",
    location: "Seattle, WA",
    testimonial: "The personalized attention we received from GDS Puppies was exceptional. They matched us perfectly with our puppy based on our lifestyle and preferences.",
    rating: 5,
    imageSrc: "https://images.unsplash.com/photo-1548142813-c348350df52b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=689&q=80",
    puppyName: "Daisy (Poodle)",
  },
  {
    id: 6,
    name: "Robert Thompson",
    location: "Denver, CO",
    testimonial: "As first-time dog owners, we had a lot of questions. The team at GDS was patient and informative, making the whole experience stress-free.",
    rating: 4,
    imageSrc: "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=699&q=80",
    puppyName: "Rocky (Boxer)",
  },
];

const Reviews = () => {
  const { toast } = useToast();
  const [reviewForm, setReviewForm] = useState({
    name: "",
    email: "",
    puppyName: "",
    rating: 5,
    review: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating: number) => {
    setReviewForm(prev => ({ ...prev, rating }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Review submitted:", reviewForm);
    
    // Show success toast
    toast({
      title: "Review Submitted!",
      description: "Thank you for sharing your experience with GDS Puppies!",
    });
    
    // Reset form
    setReviewForm({
      name: "",
      email: "",
      puppyName: "",
      rating: 5,
      review: "",
    });
  };

  return (
    <div>
      <HeroSection
        title="Customer Reviews"
        subtitle="Hear from families who have welcomed GDS puppies into their homes"
        imageSrc="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1064&q=80"
        ctaText="Adopt a Puppy"
        ctaLink="/adopt"
      />

      <Section title="What Our Customers Say" withPawPrintBg>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              name={testimonial.name}
              location={testimonial.location}
              testimonial={testimonial.testimonial}
              rating={testimonial.rating}
              imageSrc={testimonial.imageSrc}
              puppyName={testimonial.puppyName}
            />
          ))}
        </div>
      </Section>

      <Section title="Share Your Experience" className="bg-secondary">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={reviewForm.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={reviewForm.email} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="puppyName">Puppy's Name & Breed</Label>
              <Input 
                id="puppyName" 
                name="puppyName" 
                value={reviewForm.puppyName} 
                onChange={handleChange} 
                placeholder="e.g., Bella (Golden Retriever)"
                required 
              />
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= reviewForm.rating ? "★" : "☆"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review">Your Review</Label>
              <Textarea 
                id="review" 
                name="review" 
                value={reviewForm.review} 
                onChange={handleChange} 
                rows={5}
                placeholder="Share your experience with your GDS puppy"
                required 
              />
            </div>

            <Button type="submit" className="bg-brand-red hover:bg-red-700 text-white w-full">
              Submit Review
            </Button>
          </form>
        </div>
      </Section>
    </div>
  );
};

export default Reviews;

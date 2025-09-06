import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import TestimonialCard from "@/components/TestimonialCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Reviews = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    puppyName: "",
    puppyBreed: "",
    review: "",
    rating: 5,
  });
  
  const { toast } = useToast();

  const { data: testimonials, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('admin_approved', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('testimonials')
        .insert({
          name: formData.name,
          content: formData.review,
          puppy_name: formData.puppyName,
          rating: formData.rating,
          admin_approved: false, // Requires admin approval
          source: 'local'
        });

      if (error) throw error;

      toast({
        title: "Review Submitted!",
        description: "Thank you for your review! It will be published after approval.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        puppyName: "",
        puppyBreed: "",
        review: "",
        rating: 5,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <HeroSection
        title="Happy Families"
        subtitle="See what our wonderful families have to say about their new furry friends"
        imageSrc="https://images.unsplash.com/photo-1583337130417-3346a1be7dee"
        ctaText="Share Your Story"
        ctaLink="#review-form"
      />

      {/* Customer Testimonials */}
      <Section title="Customer Reviews" subtitle="Real stories from real families">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : testimonials && testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.id}
                name={testimonial.name}
                location={testimonial.location || ""}
                testimonial={testimonial.content}
                rating={testimonial.rating || 5}
                imageSrc={testimonial.reviewer_avatar || testimonial.image}
                puppyName={testimonial.puppy_name || ""}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-4">No reviews yet</h3>
            <p className="text-muted-foreground">Be the first to share your experience!</p>
          </div>
        )}
      </Section>

      {/* Review Form */}
      <Section 
        title="Share Your Experience" 
        subtitle="Help other families by sharing your story"
      >
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Write a Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="puppyName">Puppy's Name</Label>
                    <Input
                      id="puppyName"
                      name="puppyName"
                      value={formData.puppyName}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="puppyBreed">Breed</Label>
                    <Input
                      id="puppyBreed"
                      name="puppyBreed"
                      value={formData.puppyBreed}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rating *</Label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingChange(star)}
                        className={`text-2xl ${
                          star <= formData.rating ? "text-yellow-400" : "text-gray-300"
                        } hover:text-yellow-400 transition-colors`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {formData.rating} of 5 stars
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review">Your Review *</Label>
                  <Textarea
                    id="review"
                    name="review"
                    value={formData.review}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us about your experience with your new family member..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Submit Review
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
};

export default Reviews;
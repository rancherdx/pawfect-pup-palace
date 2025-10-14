import { Helmet } from "react-helmet-async";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, PawPrint } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import { supabase } from "@/integrations/supabase/client";
import { useContactInfo } from "@/hooks/useContactInfo";

const ContactCard = ({ icon: Icon, title, details }: { icon: React.ElementType, title: string, details: string | string[] }) => (
  <Card className="p-6 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="font-semibold mb-2">{title}</h3>
    <div className="text-muted-foreground">
      {Array.isArray(details) ? (
        details.map((detail, index) => <p key={index}>{detail}</p>)
      ) : (
        <p>{details}</p>
      )}
    </div>
  </Card>
);

const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject."),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  const { contactInfo } = useContactInfo();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Log form submission to database
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('form_submissions').insert([{
        form_name: 'contact',
        form_data: data,
        user_email: data.email,
        user_id: user?.id || null,
        status: 'pending',
      }]);

      if (process.env.NODE_ENV === 'development') {
        console.log("[DEV] Contact form submitted:", data);
      }
      
      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
      });
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "GDS Puppies",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-555-123-4567",
        "contactType": "customer service",
        "email": "woof@gdspuppies.com",
        "hoursAvailable": "Mo-Fr 09:00-17:00"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Puppy Lane",
        "addressLocality": "Dogtown",
        "addressRegion": "CA", 
        "postalCode": "90210",
        "addressCountry": "US"
      }
    }
  };

  return (
    <div>
      <Helmet>
        <title>Contact GDS Puppies - Get in Touch | GDS Puppies</title>
        <meta name="description" content="Contact GDS Puppies for puppy adoption inquiries, breeding questions, or to schedule a visit. Phone: (555) 123-4567, Email: woof@gdspuppies.com" />
        <meta name="keywords" content="contact GDS Puppies, puppy adoption contact, dog breeder contact, GDS Puppies phone, puppy inquiry, schedule visit" />
        <link rel="canonical" href="https://gdspuppies.com/contact" />
        <meta property="og:title" content="Contact GDS Puppies - Get in Touch" />
        <meta property="og:description" content="Contact us for puppy adoption inquiries, breeding questions, or to schedule a visit. We'd love to hear from you!" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://gdspuppies.com/contact" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contact GDS Puppies - Get in Touch" />
        <meta name="twitter:description" content="Contact us for puppy adoption inquiries, breeding questions, or to schedule a visit. We'd love to hear from you!" />
        <meta name="twitter:image" content="https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <HeroSection
        title="Contact Us"
        subtitle="We'd love to hear from you. Contact us with any questions about our puppies or adoption process."
        imageSrc="https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
        ctaText="View Available Puppies"
        ctaLink="/puppies"
      />

      <Section className="bg-secondary/20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ContactCard 
            icon={Phone} 
            title="Phone" 
            details={[
              contactInfo?.phone || "(555) 123-4567", 
              "Monday - Friday, 9am - 5pm"
            ]} 
          />
          <ContactCard 
            icon={Mail} 
            title="Email" 
            details={[
              contactInfo?.email || "contact@gdspuppies.com", 
              "We respond within 24 hours"
            ]} 
          />
          <ContactCard 
            icon={MapPin} 
            title="Location" 
            details={[
              `${contactInfo?.address_city || 'Detroit'}, ${contactInfo?.address_state || 'Michigan'}`, 
              "Home-based breeder"
            ]} 
          />
        </div>
      </Section>

      <Section title="Send Us a Message" withPawPrintBg>
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input id="phone" type="tel" {...register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Controller
                  name="subject"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="subject"><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="adoption">Adoption Process</SelectItem>
                        <SelectItem value="puppy">Specific Puppy</SelectItem>
                        <SelectItem value="visit">Schedule a Visit</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.subject && <p className="text-destructive text-sm mt-1">{errors.subject.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" rows={6} placeholder="Let us know how we can help you..." {...register("message")} />
              {errors.message && <p className="text-destructive text-sm mt-1">{errors.message.message}</p>}
            </div>
            <Button type="submit">
              <PawPrint className="mr-2 h-5 w-5" />
              Send Message
            </Button>
          </form>
        </div>
      </Section>
    </div>
  );
};

export default Contact;
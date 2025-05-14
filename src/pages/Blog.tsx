
import { useState } from "react";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, User, ArrowRight } from "lucide-react";

// Sample blog posts data
const BLOG_POSTS = [
  {
    id: "1",
    title: "Top 10 Tips for New Puppy Owners",
    excerpt: "Essential advice for welcoming your new furry friend home and setting up a successful routine.",
    content: "Lorem ipsum dolor sit amet...",
    author: "Dr. Sarah Johnson",
    date: "2023-05-15",
    category: "puppy-care",
    tags: ["new-puppy", "training", "essentials"],
    imageSrc: "https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3",
    readTime: "5 min"
  },
  {
    id: "2",
    title: "Puppy Vaccination Schedule: What You Need to Know",
    excerpt: "A comprehensive guide to your puppy's vaccination needs from 8 weeks through adulthood.",
    content: "Lorem ipsum dolor sit amet...",
    author: "Dr. Michael Williams",
    date: "2023-06-22",
    category: "health",
    tags: ["vaccinations", "health", "puppy-care"],
    imageSrc: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3",
    readTime: "7 min"
  },
  {
    id: "3",
    title: "Crate Training Made Easy",
    excerpt: "Learn how to make crate training a positive experience for your new puppy with these expert tips.",
    content: "Lorem ipsum dolor sit amet...",
    author: "Trainer Emma Davis",
    date: "2023-07-05",
    category: "training",
    tags: ["crate-training", "training", "puppy-care"],
    imageSrc: "https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?ixlib=rb-4.0.3",
    readTime: "6 min"
  },
  {
    id: "4",
    title: "Nutritional Needs for Growing Puppies",
    excerpt: "Understanding the specific dietary requirements of puppies to ensure healthy growth and development.",
    content: "Lorem ipsum dolor sit amet...",
    author: "Nutrition Specialist Alex Thompson",
    date: "2023-08-12",
    category: "nutrition",
    tags: ["nutrition", "diet", "growth"],
    imageSrc: "https://images.unsplash.com/photo-1623387641168-d9803ddd3f35?ixlib=rb-4.0.3",
    readTime: "8 min"
  },
  {
    id: "5",
    title: "Socialization: The Key to a Well-Adjusted Dog",
    excerpt: "Why socializing your puppy in their early months is crucial for developing a confident, friendly adult dog.",
    content: "Lorem ipsum dolor sit amet...",
    author: "Behaviorist Rachel Cooper",
    date: "2023-09-03",
    category: "behavior",
    tags: ["socialization", "behavior", "puppy-development"],
    imageSrc: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3",
    readTime: "5 min"
  },
  {
    id: "6",
    title: "Common Puppy Health Issues to Watch For",
    excerpt: "Learn to recognize signs of common health problems in puppies and when to seek veterinary care.",
    content: "Lorem ipsum dolor sit amet...",
    author: "Dr. Sarah Johnson",
    date: "2023-10-17",
    category: "health",
    tags: ["health", "vet-care", "symptoms"],
    imageSrc: "https://images.unsplash.com/photo-1583337426008-3e0f66dfe274?ixlib=rb-4.0.3",
    readTime: "9 min"
  }
];

// Category mapping for display
const CATEGORIES = {
  "all": "All Posts",
  "puppy-care": "Puppy Care",
  "health": "Health & Wellness",
  "training": "Training Tips",
  "nutrition": "Nutrition",
  "behavior": "Behavior & Psychology"
};

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Filter posts based on search and category
  const filteredPosts = BLOG_POSTS.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = activeCategory === "all" || post.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <HeroSection
        title="Puppy Care Blog"
        subtitle="Expert advice and tips for raising happy, healthy puppies"
        imageSrc="https://images.unsplash.com/photo-1560743173-567a3b5658b1?ixlib=rb-4.0.3"
        ctaText="Subscribe to Updates"
        ctaLink="#subscribe"
      />
      
      <Section>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
          <Tabs 
            defaultValue="all" 
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full md:w-auto"
          >
            <TabsList>
              {Object.entries(CATEGORIES).map(([key, label]) => (
                <TabsTrigger key={key} value={key}>{label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          <div className="w-full md:w-64">
            <Input
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </div>
        
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <Card key={post.id} className="overflow-hidden flex flex-col h-full border border-brand-red/20 hover:shadow-puppy transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.imageSrc} 
                    alt={post.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant="outline" className="bg-brand-red/10 text-brand-red border-brand-red/30">
                      {CATEGORIES[post.category as keyof typeof CATEGORIES]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{post.readTime} read</span>
                  </div>
                  <CardTitle className="hover:text-brand-red transition-colors cursor-pointer">
                    <a href={`/blog/${post.id}`}>{post.title}</a>
                  </CardTitle>
                  <CardDescription className="flex items-center space-x-2 text-xs">
                    <User className="h-3 w-3" />
                    <span>{post.author}</span>
                    <span>•</span>
                    <CalendarDays className="h-3 w-3" />
                    <span>{formatDate(post.date)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="line-clamp-3">{post.excerpt}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="p-0 hover:bg-transparent hover:text-brand-red" asChild>
                    <a href={`/blog/${post.id}`}>
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg border border-brand-red/20">
            <h3 className="text-xl font-semibold mb-2">No blog posts found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search or category filter</p>
            <Button 
              onClick={() => {setSearchTerm(""); setActiveCategory("all");}}
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </Section>
      
      <Section className="bg-muted/50">
        <div id="subscribe" className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Subscribe to Puppy Care Updates</h2>
          <p className="mb-6">
            Get the latest training tips, health advice, and puppy care information delivered to your inbox.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Input 
              placeholder="Your email address" 
              type="email" 
              className="flex-grow"
            />
            <Button className="bg-brand-red hover:bg-red-700 text-white">
              Subscribe
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            We respect your privacy and will never share your information. Unsubscribe anytime.
          </p>
        </div>
      </Section>
    </div>
  );
};

export default Blog;

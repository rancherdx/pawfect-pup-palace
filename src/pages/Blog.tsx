
import { useState } from "react";
import { Link } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FileText, Search, Tag } from "lucide-react";

// Mock blog post data
const blogPosts = [
  {
    id: 1,
    title: "Essential Care for Your New Puppy: The First 30 Days",
    excerpt: "Bringing home a new puppy is exciting! Here's everything you need to know to get started on the right paw.",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3",
    publishedAt: "2025-01-15",
    category: "care",
    slug: "essential-puppy-care-first-30-days",
    readTime: "6 min read"
  },
  {
    id: 2,
    title: "Puppy Vaccination Schedule: What You Need to Know",
    excerpt: "Keeping your puppy healthy starts with proper vaccinations. Learn about the recommended schedule and why each vaccine matters.",
    image: "https://images.unsplash.com/photo-1611173622330-1c731c6d970e?ixlib=rb-4.0.3",
    publishedAt: "2025-02-03",
    category: "health",
    slug: "puppy-vaccination-schedule",
    readTime: "5 min read"
  },
  {
    id: 3,
    title: "Crate Training: Creating a Safe Space for Your Puppy",
    excerpt: "Effective crate training helps your puppy feel secure and makes house training easier. Follow these steps for success.",
    image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?ixlib=rb-4.0.3",
    publishedAt: "2025-02-17",
    category: "training",
    slug: "crate-training-safe-space",
    readTime: "7 min read"
  },
  {
    id: 4,
    title: "The Best Toys for Puppies: Safe and Engaging Options",
    excerpt: "Choose the right toys for your puppy's development stage. Learn which toys encourage healthy play and which to avoid.",
    image: "https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3",
    publishedAt: "2025-03-05",
    category: "lifestyle",
    slug: "best-puppy-toys-safe-engaging",
    readTime: "4 min read"
  },
  {
    id: 5,
    title: "Puppy Nutrition: Choosing the Right Food for Growth",
    excerpt: "Proper nutrition is essential for healthy puppy development. Learn how to select the best food for your puppy's needs.",
    image: "https://images.unsplash.com/photo-1616668983570-a971f89ab322?ixlib=rb-4.0.3",
    publishedAt: "2025-03-20",
    category: "nutrition",
    slug: "puppy-nutrition-right-food",
    readTime: "8 min read"
  },
  {
    id: 6,
    title: "Socializing Your Puppy: Building Confidence in New Situations",
    excerpt: "Early socialization helps puppies grow into well-adjusted adult dogs. Learn effective socialization techniques.",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3",
    publishedAt: "2025-04-02",
    category: "training",
    slug: "socializing-puppy-confidence",
    readTime: "6 min read"
  }
];

const categories = [
  { id: "all", name: "All Posts" },
  { id: "care", name: "Puppy Care" },
  { id: "health", name: "Health & Wellness" },
  { id: "training", name: "Training Tips" },
  { id: "nutrition", name: "Nutrition" },
  { id: "lifestyle", name: "Lifestyle" }
];

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Filter posts by category and search term
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = activeCategory === "all" || post.category === activeCategory;
    const matchesSearch = searchTerm === "" ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <HeroSection
        title="Puppy Blog"
        subtitle="Tips, advice, and stories to help you be the best puppy parent"
        imageSrc="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?ixlib=rb-4.0.3"
        ctaText="Subscribe"
        ctaLink="/contact"
      />
      
      <Section>
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Latest Articles</h1>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-9 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs 
          value={activeCategory} 
          onValueChange={setActiveCategory} 
          className="w-full mb-8"
        >
          <TabsList className="flex justify-start overflow-x-auto pb-2 mb-2 space-x-1 border-b">
            {categories.map(category => (
              <TabsTrigger 
                key={category.id} 
                value={category.id} 
                className="rounded-full px-4 py-1.5 text-sm"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105" 
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium capitalize">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{post.publishedAt}</span>
                      <span className="text-primary font-medium text-sm">Read more</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-bold mb-2">No articles found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </Section>
    </div>
  );
};

export default Blog;

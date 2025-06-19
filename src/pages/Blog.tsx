import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FileText, Search, Tag, Loader2, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { blogApi } from "@/api";
import { BlogPost, BlogPostsResponse } from "@/types";

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: blogData, isLoading, isError, error } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: () => blogApi.getPosts({ limit: 100 }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const rawPosts: BlogPost[] = blogData?.posts || [];

  const categories = useMemo(() => {
    const allCats = new Set(rawPosts.map(post => post.category).filter(Boolean) as string[]);
    const uniqueCategories = Array.from(allCats).map(cat => ({ id: cat.toLowerCase(), name: cat }));
    return [{ id: "all", name: "All Posts" }, ...uniqueCategories];
  }, [rawPosts]);

  const filteredPosts = useMemo(() => {
    return rawPosts.filter(post => {
      const matchesCategory = activeCategory === "all" || (post.category && post.category.toLowerCase() === activeCategory);
      const matchesSearch = searchTerm === "" ||
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.content && post.content.toLowerCase().includes(searchTerm.toLowerCase())); // Also search in content

      return matchesCategory && matchesSearch && post.status === 'published'; // Only show published posts
    });
  }, [rawPosts, activeCategory, searchTerm]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Date N/A";
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Estimated read time (simple version)
  const calculateReadTime = (content: string): string => {
    if (!content) return "N/A";
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };


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
          {categories.length > 1 && ( // Only show tabs if there are categories
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
          )}
        </Tabs>
        
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-brand-red" />
          </div>
        )}
        {isError && (
          <div className="text-center py-20 bg-red-50 p-6 rounded-md">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-red-700">Error Loading Blog Posts</h3>
            <p className="text-muted-foreground mb-4">{error?.message || "An unknown error occurred."}</p>
          </div>
        )}

        {!isLoading && !isError && filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post: BlogPost) => (
              <Link key={post.id} to={`/blog/${post.slug}`}>
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                  <div className="aspect-video w-full overflow-hidden">
                    <img 
                      src={post.featuredImageUrl || "https://via.placeholder.com/400x300?text=Blog+Post"}
                      alt={post.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105" 
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {post.category && (
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium capitalize">
                          {post.category}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {calculateReadTime(post.content)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h3>
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {post.excerpt || post.content.substring(0, 150) + "..."}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{formatDate(post.publishedAt)}</span>
                      <span className="text-primary font-medium text-sm">Read more &rarr;</span>
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

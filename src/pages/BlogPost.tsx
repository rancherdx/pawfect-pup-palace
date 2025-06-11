import { useParams, Link, useNavigate } from "react-router-dom";
// Removed useState, useEffect for direct useQuery usage
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Tag, Share2, Link as LinkIcon, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { blogApi } from "@/api";
import { BlogPost as BlogPostType, BlogPostAuthor } from "@/types"; // Renamed BlogPost to BlogPostType to avoid conflict with component name

// Helper to display author information
const getAuthorDisplay = (author?: BlogPostAuthor | string): string => {
  if (!author) return "Anonymous";
  if (typeof author === 'string') return author;
  return author.name;
};

const BlogPostPage = () => { // Renamed component to avoid conflict with type
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: post, isLoading, isError, error } = useQuery<BlogPostType, Error>(
    ['blogPost', slug],
    () => {
      if (!slug) throw new Error("No slug provided");
      return blogApi.getBySlug(slug);
    },
    {
      enabled: !!slug, // Only run query if slug is available
      retry: false, // Don't retry on 404s etc.
    }
  );

  // For related posts, this is a placeholder.
  // In a real app, you might fetch these based on post.relatedPosts slugs or tags/category.
  // const { data: relatedPostsData } = useQuery<BlogPostsResponse, Error>(
  //   ['relatedBlogPosts', post?.id],
  //   () => blogApi.getPosts({ limit: 2, /* other params like category: post.category */ }),
  //   { enabled: !!post && (post.relatedPosts && post.relatedPosts.length > 0) }
  // );
  // const relatedPostsList = relatedPostsData?.posts || [];


  const copyLinkToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: "Share this article with your friends."
      });
    });
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Date N/A";
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };
  
  if (isLoading) {
    return (
      <Section>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-brand-red" />
        </div>
      </Section>
    );
  }

  if (isError || !post) {
    return (
      <Section>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Article Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || "The article you're looking for doesn't exist or has been moved."}
            </p>
            <Button asChild onClick={() => navigate('/blog')}>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <div>
      {/* Hero Image */}
      <div 
        className="w-full h-[50vh] md:h-[60vh] bg-cover bg-center flex items-end relative"
        style={{ backgroundImage: `url(${post.featuredImageUrl || 'https://via.placeholder.com/1200x600?text=Blog+Image'})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="container mx-auto px-4 py-8 md:py-12 relative z-10">
          <Link 
            to="/blog" 
            className="inline-flex items-center text-white mb-4 hover:underline transition-all bg-black/30 hover:bg-black/50 px-3 py-1.5 rounded-md text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all articles
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl">{post.title}</h1>
        </div>
      </div>
      
      <Section className="max-w-3xl mx-auto py-8 md:py-12">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground mb-8 text-sm">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            {getAuthorDisplay(post.author)}
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(post.publishedAt || post.createdAt)}
          </div>
          {post.category && (
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              <span className="capitalize">{post.category}</span>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto -mr-2" // Adjust margin for better alignment
            onClick={copyLinkToClipboard}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        
        <div 
          className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-primary max-w-none prose-img:rounded-md"
          dangerouslySetInnerHTML={{ __html: post.content }} // Ensure content is sanitized if from user input
        />
        
        <div className="flex items-center justify-between border-t border-b py-6 my-8">
          <div>
            <h4 className="font-medium">Share this article</h4>
            <p className="text-sm text-muted-foreground">Help others learn about puppy care</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={copyLinkToClipboard} title="Copy link">
              <LinkIcon className="h-4 w-4" />
            </Button>
            {/* Additional social share buttons would go here */}
          </div>
        </div>
        
        {/* Placeholder for Related Posts - requires more logic or API support */}
        {/* {relatedPostsList.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPostsList.map((relatedPost) => (
                <Link key={relatedPost.slug} to={`/blog/${relatedPost.slug}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={relatedPost.featuredImageUrl || "https://via.placeholder.com/300x200?text=Related"}
                        alt={relatedPost.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      {relatedPost.category && (
                        <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium capitalize inline-block mb-2">
                          {relatedPost.category}
                        </div>
                      )}
                      <h3 className="font-bold mb-2">{relatedPost.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )} */}
      </Section>
    </div>
  );
};

export default BlogPostPage; // Renamed component

import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, User, Tag, Share2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock blog post database
const blogPostsData = [
  {
    slug: "essential-puppy-care-first-30-days",
    title: "Essential Care for Your New Puppy: The First 30 Days",
    author: "Dr. Sarah Johnson",
    date: "January 15, 2025",
    category: "care",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3",
    content: `
      <p class="mb-4">Bringing home a new puppy is one of life's greatest joys. Those tiny paws, wet nose, and endless enthusiasm can melt even the sternest heart. But along with all that cuteness comes responsibility. The first month with your new puppy is crucial for establishing habits that will last a lifetime.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Before Your Puppy Arrives</h2>
      
      <p class="mb-4">Preparation is key to a smooth transition for both you and your puppy:</p>
      
      <ul class="list-disc ml-6 mb-6 space-y-2">
        <li><strong>Puppy-proof your home:</strong> Remove dangerous items, secure loose wires, and put away small objects that could be swallowed.</li>
        <li><strong>Purchase essential supplies:</strong> Food and water bowls, proper puppy food, collar and leash, ID tags, crate, bed, toys, grooming supplies, and cleaning products for accidents.</li>
        <li><strong>Find a veterinarian:</strong> Research and choose a vet before bringing your puppy home.</li>
        <li><strong>Create a schedule:</strong> Plan feeding, bathroom breaks, playtime, and sleep times.</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">The First Week: Adjustment Period</h2>
      
      <p class="mb-4">The first week is all about helping your puppy adjust to their new environment:</p>
      
      <ul class="list-disc ml-6 mb-6 space-y-2">
        <li><strong>Create a safe space:</strong> Use a crate or small gated area where your puppy can feel secure.</li>
        <li><strong>Establish a routine:</strong> Consistent schedules help puppies learn what to expect.</li>
        <li><strong>Begin house training:</strong> Take your puppy outside frequently, especially after eating, drinking, playing, or waking up.</li>
        <li><strong>First vet visit:</strong> Schedule this within the first few days to check for health issues and discuss vaccination schedules.</li>
      </ul>
      
      <div class="bg-muted p-6 rounded-lg my-8">
        <h3 class="text-xl font-bold mb-3">Pro Tip: Night-time Strategy</h3>
        <p>Those first few nights can be challenging. Try placing a ticking clock wrapped in a blanket near your puppy's sleeping area—the sound mimics a mother's heartbeat and can provide comfort. A warm (not hot) water bottle can also help.</p>
      </div>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Weeks 2-4: Building Foundations</h2>
      
      <p class="mb-4">Once your puppy has settled in, it's time to focus on training and socialization:</p>
      
      <ul class="list-disc ml-6 mb-6 space-y-2">
        <li><strong>Basic commands:</strong> Start teaching simple commands like "sit," "stay," and "come."</li>
        <li><strong>Socialization:</strong> Expose your puppy to different people, environments, sounds, and experiences.</li>
        <li><strong>Handling exercises:</strong> Get your puppy comfortable with being touched on all parts of their body.</li>
        <li><strong>Prevent resource guarding:</strong> Practice taking away and returning food bowls and toys.</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Health and Nutrition</h2>
      
      <p class="mb-4">Proper care in the first month sets the foundation for a lifetime of health:</p>
      
      <ul class="list-disc ml-6 mb-6 space-y-2">
        <li><strong>Vaccinations:</strong> Follow your vet's recommended vaccination schedule.</li>
        <li><strong>Parasite prevention:</strong> Discuss flea, tick, and worm prevention with your vet.</li>
        <li><strong>Nutrition:</strong> Feed high-quality puppy food appropriate for your dog's breed and size.</li>
        <li><strong>Monitor health:</strong> Watch for signs of illness like lethargy, loss of appetite, vomiting, or diarrhea.</li>
      </ul>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Common First Month Challenges</h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        <div class="bg-background shadow rounded-lg p-5 border">
          <h3 class="font-bold text-lg mb-2">Nipping and Biting</h3>
          <p>Puppies explore with their mouths, but need to learn bite inhibition. When they bite too hard, yelp loudly and stop playing momentarily.</p>
        </div>
        <div class="bg-background shadow rounded-lg p-5 border">
          <h3 class="font-bold text-lg mb-2">Potty Training Accidents</h3>
          <p>Stay patient and consistent. Never punish accidents—instead, clean thoroughly and increase vigilance for potty signs.</p>
        </div>
        <div class="bg-background shadow rounded-lg p-5 border">
          <h3 class="font-bold text-lg mb-2">Crying at Night</h3>
          <p>It's normal for puppies to cry when first separated from their littermates. Provide comfort but avoid reinforcing excessive attention-seeking behavior.</p>
        </div>
        <div class="bg-background shadow rounded-lg p-5 border">
          <h3 class="font-bold text-lg mb-2">Chewing Everything</h3>
          <p>Provide appropriate chew toys and redirect inappropriate chewing. Puppy-proof thoroughly and supervise closely.</p>
        </div>
      </div>
      
      <p class="mb-4">Remember that patience and consistency are your best tools during this adjustment period. Every puppy learns at their own pace, and positive reinforcement will help build a strong foundation for your life together.</p>
      
      <p class="mb-4">By focusing on these essentials during the first 30 days, you'll help your puppy develop into a well-adjusted, happy adult dog. The time and effort you invest now will pay dividends in the years of companionship ahead.</p>
    `,
    relatedPosts: ["puppy-vaccination-schedule", "crate-training-safe-space"]
  },
  {
    slug: "puppy-vaccination-schedule",
    title: "Puppy Vaccination Schedule: What You Need to Know",
    author: "Dr. Michael Chang",
    date: "February 3, 2025",
    category: "health",
    image: "https://images.unsplash.com/photo-1611173622330-1c731c6d970e?ixlib=rb-4.0.3",
    content: `
      <p class="mb-4">Proper vaccination is one of the most important ways to protect your puppy's health. Vaccines help prevent many serious and potentially fatal diseases by stimulating the immune system to recognize and fight specific infections.</p>
      
      <h2 class="text-2xl font-bold mt-8 mb-4">Core Vaccines Every Puppy Needs</h2>
      
      <p class="mb-4">Core vaccines are recommended for all dogs regardless of their lifestyle:</p>
      
      <ul class="list-disc ml-6 mb-6 space-y-2">
        <li><strong>Distemper:</strong> A highly contagious viral disease affecting the respiratory, gastrointestinal, and nervous systems.</li>
        <li><strong>Parvovirus:</strong> A potentially deadly disease causing severe vomiting, diarrhea, and dehydration.</li>
        <li><strong>Adenovirus (Hepatitis):</strong> Causes liver disease and can be fatal, especially in young puppies.</li>
        <li><strong>Rabies:</strong> Fatal for dogs and transmissible to humans; vaccination is required by law in most places.</li>
      </ul>
      
      <div class="bg-muted p-6 rounded-lg my-8">
        <h3 class="text-xl font-bold mb-3">Typical Vaccination Schedule</h3>
        <p>While schedules may vary based on your veterinarian's recommendations and local requirements, here's a general guideline:</p>
      </div>
      
      <!-- Rest of the article content would go here -->
    `,
    relatedPosts: ["essential-puppy-care-first-30-days", "socializing-puppy-confidence"]
  }
];

// Mock related post function
const getRelatedPosts = (slugs: string[]) => {
  return blogPostsData.filter(post => slugs.includes(post.slug)).map(post => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.content.substring(0, 120) + "...",
    image: post.image,
    category: post.category
  }));
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // In a real app, this would fetch from an API
    const foundPost = blogPostsData.find(p => p.slug === slug);
    if (foundPost) {
      setPost(foundPost);
      
      if (foundPost.relatedPosts?.length) {
        setRelatedPosts(getRelatedPosts(foundPost.relatedPosts));
      }
    }
  }, [slug]);

  const copyLinkToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: "Share this article with your friends."
      });
    });
  };
  
  if (!post) {
    return (
      <Section>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Article not found</h2>
            <p className="text-muted-foreground mb-4">The article you're looking for doesn't exist or has been moved.</p>
            <Button asChild>
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
        className="w-full h-[40vh] bg-cover bg-center flex items-end relative"
        style={{ backgroundImage: `url(${post.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="container mx-auto px-4 py-8 relative z-10">
          <Link 
            to="/blog" 
            className="flex items-center text-white mb-4 hover:underline transition-all"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all articles
          </Link>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white max-w-4xl">{post.title}</h1>
        </div>
      </div>
      
      <Section className="max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8 text-sm">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            {post.author}
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {post.date}
          </div>
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            <span className="capitalize">{post.category}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-auto"
            onClick={copyLinkToClipboard}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        
        <div 
          className="prose prose-lg dark:prose-invert prose-headings:font-bold prose-a:text-primary max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        <div className="flex items-center justify-between border-t border-b py-6 my-8">
          <div>
            <h4 className="font-medium">Share this article</h4>
            <p className="text-sm text-muted-foreground">Help others learn about puppy care</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={copyLinkToClipboard}>
              <LinkIcon className="h-4 w-4" />
            </Button>
            {/* Additional social share buttons would go here */}
          </div>
        </div>
        
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} to={`/blog/${relatedPost.slug}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow h-full">
                    <div className="aspect-video w-full overflow-hidden">
                      <img 
                        src={relatedPost.image} 
                        alt={relatedPost.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium capitalize inline-block mb-2">
                        {relatedPost.category}
                      </div>
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
        )}
      </Section>
    </div>
  );
};

export default BlogPost;

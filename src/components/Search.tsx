import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Search as SearchIcon, Dog, File, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: "puppy" | "litter" | "blog" | "page";
  url: string;
}

const Search = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  
  // Real search function using Supabase
  const performSearch = async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const searchTerm = term.toLowerCase();
      const allResults: SearchResult[] = [];

      // Search puppies
      const { data: puppies, error: puppiesError } = await supabase
        .from('puppies')
        .select('id, name, breed, description, status')
        .or(`name.ilike.%${searchTerm}%,breed.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(10);

      if (!puppiesError && puppies) {
        puppies.forEach(puppy => {
          allResults.push({
            id: puppy.id,
            title: `${puppy.name} - ${puppy.breed}`,
            excerpt: puppy.description || `${puppy.status} ${puppy.breed} puppy`,
            type: "puppy",
            url: `/puppies/${puppy.id}`
          });
        });
      }

      // Search litters
      const { data: litters, error: littersError } = await supabase
        .from('litters')
        .select('id, name, breed, description')
        .or(`name.ilike.%${searchTerm}%,breed.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(10);

      if (!littersError && litters) {
        litters.forEach(litter => {
          allResults.push({
            id: litter.id,
            title: litter.name,
            excerpt: litter.description || `${litter.breed} litter`,
            type: "litter",
            url: `/litters/${litter.id}`
          });
        });
      }

      // Search blog posts
      const { data: blogPosts, error: blogError } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, slug')
        .eq('status', 'published')
        .or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
        .limit(10);

      if (!blogError && blogPosts) {
        blogPosts.forEach(post => {
          allResults.push({
            id: post.id,
            title: post.title,
            excerpt: post.excerpt || 'Blog post',
            type: "blog",
            url: `/blog/${post.slug}`
          });
        });
      }

      setResults(allResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSearch = () => {
    if (searchTerm.trim().length > 0) {
      performSearch(searchTerm);
    } else {
      setResults([]);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };
  
  const goToResult = (url: string) => {
    setIsOpen(false);
    navigate(url);
  };
  
  const getFilteredResults = () => {
    if (activeTab === "all") {
      return results;
    }
    return results.filter(result => result.type === activeTab);
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "puppy":
        return <Dog className="h-4 w-4 text-brand-red" />;
      case "litter":
        return <Dog className="h-4 w-4 text-blue-500" />;
      case "blog":
      case "page":
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "puppy":
        return "Puppy";
      case "litter":
        return "Litter";
      case "blog":
        return "Blog";
      case "page":
        return "Page";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  const filteredResults = getFilteredResults();
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full md:w-auto border-dashed" 
          onClick={() => setIsOpen(true)}
        >
          <SearchIcon className="mr-2 h-4 w-4" />
          <span className="hidden md:inline">Search site...</span>
          <span className="md:hidden">Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Search GDS Puppies</DialogTitle>
          <DialogDescription>
            Find puppies, litters, blog posts, and more.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pr-8"
                autoFocus
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
          
          {(results.length > 0 || isSearching) && (
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="puppy">Puppies</TabsTrigger>
                <TabsTrigger value="litter">Litters</TabsTrigger>
                <TabsTrigger value="blog">Blog</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {filteredResults.map((result) => (
                      <div 
                        key={result.id}
                        className="p-3 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer"
                        onClick={() => goToResult(result.url)}
                      >
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(result.type)}
                          <span className="text-xs text-muted-foreground">
                            {getTypeLabel(result.type)}
                          </span>
                        </div>
                        <h4 className="font-medium mt-1">{result.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {result.excerpt}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No results found</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
          
          {!isSearching && searchTerm && results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No results found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try different keywords or browse our site sections
              </p>
            </div>
          )}
          
          {!searchTerm && !isSearching && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Enter a search term to find puppies, litters, blog posts, and more
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Search;

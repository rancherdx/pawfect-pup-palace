
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dog, File, X, Loader2 } from "lucide-react";
import SearchResult from "./SearchResult";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: "puppy" | "litter" | "blog" | "page";
  url: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

const GlobalSearch = ({ isOpen, onClose }: GlobalSearchProps) => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  // Reset search when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setResults([]);
    }
  }, [isOpen]);

  // Handle keyboard events for Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!isOpen) {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);
  
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
    onClose();
    navigate(url);
  };
  
  const getFilteredResults = () => {
    if (activeTab === "all") {
      return results;
    }
    return results.filter(result => result.type === activeTab);
  };
  
  const filteredResults = getFilteredResults();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] p-0">
        <DialogHeader className="px-4 pt-5 pb-0">
          <DialogTitle className="text-xl">Search GDS Puppies</DialogTitle>
          <DialogDescription>
            Find puppies, litters, blog posts, and more. Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd> to close.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 pt-5">
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
            <button 
              onClick={handleSearch}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Search
            </button>
          </div>
        </div>
        
        {(results.length > 0 || isSearching) && (
          <div className="px-4 pb-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="puppy">Puppies</TabsTrigger>
                <TabsTrigger value="litter">Litters</TabsTrigger>
                <TabsTrigger value="blog">Blog</TabsTrigger>
              </TabsList>
              
              <div className="mt-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : filteredResults.length > 0 ? (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {filteredResults.map((result) => (
                      <SearchResult 
                        key={result.id} 
                        result={result} 
                        onClick={() => goToResult(result.url)} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No results found</p>
                  </div>
                )}
              </div>
            </Tabs>
          </div>
        )}
        
        {!isSearching && searchTerm && results.length === 0 && (
          <div className="text-center py-8 px-4">
            <p className="text-muted-foreground">No results found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Try different keywords or browse our site sections
            </p>
          </div>
        )}
        
        {!searchTerm && !isSearching && (
          <div className="text-center py-8 px-4">
            <p className="text-muted-foreground">
              Enter a search term to find puppies, litters, blog posts, and more
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Pro tip: Press <kbd className="px-1 bg-muted rounded">Ctrl</kbd> + <kbd className="px-1 bg-muted rounded">K</kbd> to open search from anywhere
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GlobalSearch;

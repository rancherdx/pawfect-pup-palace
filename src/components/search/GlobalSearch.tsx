
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
  
  // Mock search function - in real app this would call an API
  const performSearch = async (term: string) => {
    setIsSearching(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock results
    const mockResults: SearchResult[] = [
      {
        id: "p1",
        title: "Buddy - Labrador Retriever",
        excerpt: "Playful and energetic yellow lab puppy",
        type: "puppy",
        url: "/puppies/1"
      },
      {
        id: "p2",
        title: "Lucy - Labrador Retriever",
        excerpt: "Sweet and calm black lab puppy",
        type: "puppy",
        url: "/puppies/2"
      },
      {
        id: "l1",
        title: "Summer 2023 Labrador Litter",
        excerpt: "A wonderful litter of 6 puppies born on June 15, 2023",
        type: "litter",
        url: "/litters/1"
      },
      {
        id: "b1",
        title: "Top 10 Tips for New Puppy Owners",
        excerpt: "Essential advice for welcoming your new furry friend home",
        type: "blog",
        url: "/blog/top-10-tips-for-new-puppy-owners"
      },
      {
        id: "b2",
        title: "Puppy Vaccination Schedule",
        excerpt: "Everything you need to know about keeping your puppy healthy with vaccinations",
        type: "blog",
        url: "/blog/puppy-vaccination-schedule"
      },
    ];
    
    // Filter based on search term
    const filtered = term.length > 0
      ? mockResults.filter(result => 
          result.title.toLowerCase().includes(term.toLowerCase()) || 
          result.excerpt.toLowerCase().includes(term.toLowerCase()))
      : [];
    
    setResults(filtered);
    setIsSearching(false);
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

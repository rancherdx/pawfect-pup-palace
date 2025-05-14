
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
import { Search as SearchIcon, Puppy, File, X, Loader2 } from "lucide-react";

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
        return <Puppy className="h-4 w-4 text-brand-red" />;
      case "litter":
        return <Puppy className="h-4 w-4 text-blue-500" />;
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


import { Dog, File, FileText } from "lucide-react";

interface SearchResultProps {
  result: {
    id: string;
    title: string;
    excerpt: string;
    type: "puppy" | "litter" | "blog" | "page";
    url: string;
  };
  onClick: () => void;
}

const SearchResult = ({ result, onClick }: SearchResultProps) => {
  const getTypeIcon = () => {
    switch (result.type) {
      case "puppy":
        return <Dog className="h-4 w-4 text-brand-red" />;
      case "litter":
        return <Dog className="h-4 w-4 text-blue-500" />;
      case "blog":
        return <FileText className="h-4 w-4 text-green-600" />;
      case "page":
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const getTypeLabel = () => {
    switch (result.type) {
      case "puppy":
        return "Puppy";
      case "litter":
        return "Litter";
      case "blog":
        return "Blog";
      case "page":
        return "Page";
      default:
        return result.type.charAt(0).toUpperCase() + result.type.slice(1);
    }
  };

  return (
    <div 
      className="p-3 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center space-x-2">
        {getTypeIcon()}
        <span className="text-xs text-muted-foreground">
          {getTypeLabel()}
        </span>
      </div>
      <h4 className="font-medium mt-1">{result.title}</h4>
      <p className="text-sm text-muted-foreground line-clamp-2">
        {result.excerpt}
      </p>
    </div>
  );
};

export default SearchResult;

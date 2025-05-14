
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Type } from "lucide-react";

export default function FontSizeSelector() {
  const [fontSize, setFontSize] = useLocalStorage("gds-font-size", "normal");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Adjust font size">
          <Type className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setFontSize("normal")}
          className={fontSize === "normal" ? "bg-secondary" : ""}
        >
          Normal Text
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setFontSize("large")}
          className={fontSize === "large" ? "bg-secondary" : ""}
        >
          Large Text
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setFontSize("xlarge")}
          className={fontSize === "xlarge" ? "bg-secondary" : ""}
        >
          Extra Large Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

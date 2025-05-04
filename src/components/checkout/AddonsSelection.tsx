
import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface AddonItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface AddonsSelectionProps {
  onDataChange: (addons: AddonItem[]) => void;
  onPriceChange: (total: number) => void;
  basePrice: number;
  selectedAddons: AddonItem[];
  onNext: () => void;
  onPrevious: () => void;
}

// Mock addons data
const addonItems: AddonItem[] = [
  {
    id: "addon-1",
    name: "Puppy Starter Kit",
    description: "Food, bowls, collar, and leash to get started",
    price: 75,
    image: "https://images.unsplash.com/photo-1585559700398-1385b3a8aeb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "addon-2",
    name: "Training Sessions (3)",
    description: "Three private training sessions with our expert",
    price: 120,
    image: "https://images.unsplash.com/photo-1600272008408-6e05d5aa3e6a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "addon-3",
    name: "Premium Bed",
    description: "Comfortable, washable bed for your new puppy",
    price: 60,
    image: "https://images.unsplash.com/photo-1636066429695-a7518ab7db5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "addon-4",
    name: "Health Check Package",
    description: "First vet visit and basic vaccinations",
    price: 150,
    image: "https://images.unsplash.com/photo-1610117802181-5fcbac55b61f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
  },
];

const AddonsSelection = ({ 
  onDataChange, 
  onPriceChange, 
  basePrice,
  selectedAddons = [],
  onNext, 
  onPrevious 
}: AddonsSelectionProps) => {
  const [addons, setAddons] = useState<AddonItem[]>(selectedAddons);
  
  useEffect(() => {
    // Calculate total price when addons change
    const addonTotal = addons.reduce((sum, item) => sum + item.price, 0);
    onPriceChange(basePrice + addonTotal);
  }, [addons, basePrice, onPriceChange]);

  const handleToggleAddon = (addon: AddonItem) => {
    if (addons.some(item => item.id === addon.id)) {
      // Remove addon
      setAddons(addons.filter(item => item.id !== addon.id));
    } else {
      // Add addon
      setAddons([...addons, addon]);
    }
  };

  const handleContinue = () => {
    onDataChange(addons);
    onNext();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start mb-6">
          <Gift className="h-6 w-6 text-brand-red mr-2 mt-1" />
          <div>
            <h2 className="text-2xl font-bold">Puppy Add-ons</h2>
            <p className="text-muted-foreground">
              Optional items to help you get started with your new puppy
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {addonItems.map(addon => {
            const isSelected = addons.some(item => item.id === addon.id);
            
            return (
              <div 
                key={addon.id}
                className={`
                  border rounded-lg overflow-hidden cursor-pointer transition-all
                  ${isSelected ? 'border-brand-red ring-1 ring-brand-red' : 'border-gray-200 hover:border-gray-300'}
                `}
                onClick={() => handleToggleAddon(addon)}
              >
                <div className="flex h-full">
                  <div className="w-1/3">
                    <img 
                      src={addon.image} 
                      alt={addon.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-2/3 p-4 flex flex-col">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-medium">{addon.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {addon.description}
                        </p>
                      </div>
                      <Checkbox 
                        checked={isSelected}
                        className={`${isSelected ? 'text-brand-red' : ''}`}
                        onCheckedChange={() => {}}
                      />
                    </div>
                    <div className="mt-auto text-right font-medium">
                      ${addon.price}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-secondary p-4 rounded-lg mb-6">
          <div className="flex justify-between mb-2">
            <span>Base Adoption Fee:</span>
            <span className="font-medium">${basePrice}</span>
          </div>
          
          {addons.length > 0 && (
            <div>
              {addons.map(addon => (
                <div key={addon.id} className="flex justify-between text-sm">
                  <span>{addon.name}:</span>
                  <span>${addon.price}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="border-t mt-2 pt-2 flex justify-between font-bold">
            <span>Total:</span>
            <span className="text-brand-red">
              ${basePrice + addons.reduce((sum, item) => sum + item.price, 0)}
            </span>
          </div>
        </div>
        
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrevious}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <Button 
            type="button" 
            className="bg-brand-red hover:bg-red-700 text-white"
            onClick={handleContinue}
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddonsSelection;

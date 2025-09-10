import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Check, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface AddonItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
}

interface AddonsSelectionProps {
  onDataChange: (addons: AddonItem[]) => void;
  onPriceChange: (total: number) => void;
  basePrice: number;
  selectedAddons: AddonItem[];
  onNext: () => void;
  onPrevious: () => void;
}

const AddonsSelection = ({ 
  onDataChange, 
  onPriceChange, 
  basePrice,
  selectedAddons = [],
  onNext, 
  onPrevious 
}: AddonsSelectionProps) => {
  const [addons, setAddons] = useState<AddonItem[]>(selectedAddons);
  
  const { data: addonItems = [], isLoading } = useQuery({
    queryKey: ['addon-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('addon_items')
        .select('*')
        .eq('is_active', true)
        .order('category, name');
      
      if (error) throw error;
      return data || [];
    },
  });
  
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
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="bg-gray-200 h-20 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {addonItems.map((addon: any) => {
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
                      src={addon.image_url} 
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
        )}
        
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
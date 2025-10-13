import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, ArrowLeft, Plus, X } from "lucide-react";

interface Pet {
  species: string;
  gender: string;
  breed: string;
  age: number;
  temperament: string;
}

interface RegisterStep4Props {
  data: {
    homeType: string;
    hasKids: boolean;
    kidsAges: Array<{ count: number; ageRange: string }>;
    hasOtherPets: boolean;
    otherPets: Pet[];
    hasFencedYard: boolean;
  };
  onUpdate: (data: Partial<RegisterStep4Props["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function RegisterStep4({ data, onUpdate, onNext, onBack }: RegisterStep4Props) {
  const [newPet, setNewPet] = useState<Pet>({ species: "", gender: "", breed: "", age: 0, temperament: "" });

  const addPet = () => {
    if (newPet.species && newPet.gender && newPet.breed && newPet.age && newPet.temperament) {
      onUpdate({ otherPets: [...data.otherPets, newPet] });
      setNewPet({ species: "", gender: "", breed: "", age: 0, temperament: "" });
    }
  };

  const removePet = (index: number) => {
    onUpdate({ otherPets: data.otherPets.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Tell Us About Your Home</h2>
        <p className="text-muted-foreground mt-2">Optional, but helps us recommend the right puppy</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Type of Home</Label>
          <Select value={data.homeType} onValueChange={(value) => onUpdate({ homeType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select home type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apartment">Apartment</SelectItem>
              <SelectItem value="condo">Condo</SelectItem>
              <SelectItem value="townhouse">Townhouse</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="farm">Farm/Ranch</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasKids"
            checked={data.hasKids}
            onCheckedChange={(checked) => onUpdate({ hasKids: !!checked })}
          />
          <Label htmlFor="hasKids" className="cursor-pointer">Do you have children?</Label>
        </div>

        {data.hasKids && (
          <div className="ml-6 space-y-2 p-4 border rounded-lg">
            <Label className="text-sm text-muted-foreground">You can add multiple age groups</Label>
            {data.kidsAges.map((group, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Count"
                  value={group.count}
                  onChange={(e) => {
                    const newKidsAges = [...data.kidsAges];
                    newKidsAges[index].count = parseInt(e.target.value) || 0;
                    onUpdate({ kidsAges: newKidsAges });
                  }}
                  className="w-20"
                />
                <Select
                  value={group.ageRange}
                  onValueChange={(value) => {
                    const newKidsAges = [...data.kidsAges];
                    newKidsAges[index].ageRange = value;
                    onUpdate({ kidsAges: newKidsAges });
                  }}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Age range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-5">0-5 years</SelectItem>
                    <SelectItem value="6-12">6-12 years</SelectItem>
                    <SelectItem value="13-17">13-17 years</SelectItem>
                    <SelectItem value="18+">18+ years</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    onUpdate({ kidsAges: data.kidsAges.filter((_, i) => i !== index) });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdate({ kidsAges: [...data.kidsAges, { count: 1, ageRange: "" }] })}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Age Group
            </Button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasOtherPets"
            checked={data.hasOtherPets}
            onCheckedChange={(checked) => onUpdate({ hasOtherPets: !!checked })}
          />
          <Label htmlFor="hasOtherPets" className="cursor-pointer">Do you have other pets?</Label>
        </div>

        {data.hasOtherPets && (
          <div className="ml-6 space-y-4 p-4 border rounded-lg">
            {data.otherPets.map((pet, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg flex justify-between items-start">
                <div className="text-sm">
                  <p className="font-medium">{pet.species} • {pet.breed}</p>
                  <p className="text-muted-foreground">{pet.gender} • {pet.age} years old • {pet.temperament}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removePet(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Species (Dog/Cat/Other)"
                  value={newPet.species}
                  onChange={(e) => setNewPet({ ...newPet, species: e.target.value })}
                />
                <Select value={newPet.gender} onValueChange={(value) => setNewPet({ ...newPet, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Breed"
                  value={newPet.breed}
                  onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Age"
                  value={newPet.age || ""}
                  onChange={(e) => setNewPet({ ...newPet, age: parseInt(e.target.value) || 0 })}
                />
              </div>
              <Input
                placeholder="Temperament"
                value={newPet.temperament}
                onChange={(e) => setNewPet({ ...newPet, temperament: e.target.value })}
              />
              <Button variant="outline" size="sm" onClick={addPet} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Pet
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="hasFencedYard"
            checked={data.hasFencedYard}
            onCheckedChange={(checked) => onUpdate({ hasFencedYard: !!checked })}
          />
          <Label htmlFor="hasFencedYard" className="cursor-pointer">Do you have a fenced yard?</Label>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

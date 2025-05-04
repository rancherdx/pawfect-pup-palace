
export type BreedTemplate = {
  id: string;
  breedName: string;
  description: string;
  size: string;
  temperament: string;
  careInstructions: string;
  commonTraits: string[];
  averageWeight: {
    min: number;
    max: number;
  };
  photo?: string;
};

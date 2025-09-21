export interface StudDog {
  id: string;
  name: string;
  breed_id: string;
  age?: number;
  description?: string;
  temperament?: string;
  certifications?: string[];
  image_urls?: string[];
  stud_fee: number;
  is_available: boolean;
  owner_user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export type StudDogCreationData = Omit<StudDog, 'id' | 'created_at' | 'updated_at'>;

export type StudDogUpdateData = Partial<StudDogCreationData>;

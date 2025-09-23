export interface Parent {
  id: string;
  name: string;
  breed: string;
  gender: 'Male' | 'Female';
  description?: string;
  image_urls?: string[];
  certifications?: string[];
  bloodline_info?: string;
  health_clearances?: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export type ParentCreationData = Omit<Parent, 'id' | 'created_at' | 'updated_at'>;

export type ParentUpdateData = Partial<ParentCreationData>;

export interface ParentListResponse {
  parents: Parent[];
  pagination?: {
    total: number;
    current_page: number;
    total_pages: number;
  };
}
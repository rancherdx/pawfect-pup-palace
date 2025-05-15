
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  publishedAt: string | null;
  author: string;
  status: "published" | "draft";
  relatedPosts?: string[];
}

export interface BlogCategory {
  id: string;
  name: string;
}

export interface AffiliatePartner {
  id: string;
  name: string;
  email: string;
  code: string;
  commission: string;
  visits: number;
  conversions: number;
  totalSales: string;
  active: boolean;
  dateCreated: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: string;
  uses: number;
  maxUses: number | null;
  startDate: string;
  endDate: string | null;
  active: boolean;
}

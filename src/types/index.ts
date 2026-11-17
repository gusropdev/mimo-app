export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  title: string;
  url: string | null;        // opcional — nem todo produto tem link
  image_url: string | null;
  price: number | null;
  store_name: string | null;
  notes: string | null;      // comentários / recadinho para quem vai presentear
  created_at: string;
  updated_at: string;
}

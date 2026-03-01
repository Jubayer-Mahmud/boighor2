export interface Book {
  id: string;
  title: string;
  author: string;
  price: number;
  discountPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  subCategory?: string;
  image: string;
  description: string;
  stock: number;
  specifications?: {
    pages?: number;
    publisher?: string;
    language?: string;
    isbn?: string;
  };
}

export interface CartItem extends Book {
  quantity: number;
}

export interface Products {
  count: number;
  products: Product[];
}

export interface Product {
  id: number;
  name: string;
  category: string;
  description: string;
  image: string;
  price: number;
  quantity: number;
  images: string[];
}

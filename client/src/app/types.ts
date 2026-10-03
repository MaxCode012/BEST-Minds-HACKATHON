export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  tags: string[];
  popular?: boolean;
};

export type CartItem = Product & {
  quantity: number;
  note?: string;
};

export type ScanStep = "choose" | "scanning" | "done";

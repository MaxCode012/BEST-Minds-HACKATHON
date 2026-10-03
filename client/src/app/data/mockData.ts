export interface MenuItem {
  id: number;
  title: string;
  price: number;
  category: string;
  allergens: string[];
  description: string;
  image: string;
}

export interface UserProfile {
  name: string;
  allergies: string[];
  preferences: string[];
}

export const MOCK_USER: UserProfile = {
  name: "Alexandru",
  allergies: ["lactoză", "alune"],
  preferences: ["fără picant", "vegetarian option"]
};

export interface CartItem extends MenuItem {
  cartItemId: string; 
  chefNote?: string;
  orderType: 'individual' | 'group';
}

export const MOCK_MENU: MenuItem[] = [
  {
    id: 1,
    title: "Paste Carbonara",
    price: 120,
    category: "Paste",
    allergens: ["lactoză", "gluten"],
    description: "Paste proaspete cu guanciale, gălbenuș de ou și parmezan.",
    image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&q=80"
  },
  {
    id: 2,
    title: "Burger Vegan",
    price: 140,
    category: "Burger",
    allergens: ["gluten"],
    description: "Chiftea din linte și ciuperci, chiflă artizanală, sos avocado.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&q=80"
  },
  {
    id: 3,
    title: "Salată Caesar",
    price: 95,
    category: "Salate",
    allergens: ["lactoză", "ou"],
    description: "Piept de pui la grătar, crutoane, sos caesar și fulgi de parmezan.",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80"
  }
];
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
  id: string;
  name: string;
  allergies: string[];
  preferences: string[];
}

export const MOCK_USER: UserProfile = {
  id: "user-1",
  name: "Alexandru",
  allergies: ["lactoză", "alune"],
  preferences: ["fără picant", "vegetarian option"]
};

export interface CartItem extends MenuItem {
  cartItemId: string; 
  chefNote?: string;
  orderType: 'individual' | 'group';
  userName: string;
}

export const mapApiToMenuItem = (item: any): MenuItem => {
  // Convert comma-separated string ("Lactoză, Gluten") into string[]
  let parsedAllergens: string[] = [];
  if (Array.isArray(item.allergens)) {
    parsedAllergens = item.allergens;
  } else if (typeof item.allergens === 'string' && item.allergens.trim().length > 0) {
    parsedAllergens = item.allergens.split(',').map((a: string) => a.trim());
  }

  return {
    id: Number(item.id ?? item.Id ?? 0),
    title: item.name ?? item.Name ?? item.title ?? item.Title ?? 'Preparat fără nume',
    price: Number(item.price ?? item.Price ?? 0),
    category: item.category ?? item.Category ?? 'General',
    allergens: parsedAllergens,
    description: item.description ?? item.Description ?? '',
    image:
      item.image_url ??
      item.imageUrl ??
      item.image ??
      item.Image ??
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
  };
};

// Fetch function to call C# backend
export const fetchMenuFromBackend = async (): Promise<MenuItem[]> => {
  try {
    const response = await fetch('http://172.30.69.205:5000/api/menu');

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const rawData = await response.json();
    return rawData.map(mapApiToMenuItem);
  } catch (error) {
    console.error('Failed to fetch backend menu, falling back to MOCK_MENU:', error);
    return MOCK_MENU; // Fallback to mock data if backend fails
  }
};



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
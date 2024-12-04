export type Product = {
  name: string;
  description: string;
  brand: string;
  categories: string[];
  hierarchicalCategories?: {
    lvl0: string;
    lvl1: string;
    lvl2: string;
    lvl3: string;
  };
  type?: string;
  price: number;
  price_range?: string;
  image: string;
  url: string;
  free_shipping: boolean;
  rating: number;
  popularity?: number;
  _geoloc?: {
    lat: number;
    lng: number;
  };
  objectID: string;
  _snippetResult?: {
    description: {
      value: string;
      matchLevel: string;
    };
  };
  _highlightResult?: {
    name: {
      value: string;
      matchLevel: string;
      matchedWords: string[];
    };
    description: {
      value: string;
      matchLevel: string;
      matchedWords: string[];
    };
    brand: {
      value: string;
      matchLevel: string;
      matchedWords: string[];
    };
    categories: {
      value: string;
      matchLevel: string;
      matchedWords: string[];
    }[];
  };
};

export type Filter = {
  search?: string
  category?: string
  priceRange?: number[],
  rating?: number
  brand?: string[]
  freeShipping?: boolean
}

export type BrandOption = {
  label: string
  value: string
}

export type ResponseData = {
  [key: string | number]: number;
}

export type Subcategory = {
  name: string;
  total: number;
};

export type Category = {
  name: string;
  total: number;
  subcategories: Subcategory[];
};
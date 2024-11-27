import { ICard } from "../types";

export const items: ICard[] = Array.from({ length: 32 }, (_, index) => ({
  image: 'src/assets/images/images.jpg',
  url: `https://example.com/product-${index + 1}`,
  name: `Product Name ${index + 1}`,
  rating: (Math.random() * 5).toFixed(1) as unknown as number,
  price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
  description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Product ${index + 1} has unique features.`,
  categories: ['Electronics', 'Gadgets', `Category ${index % 5}`],
}));

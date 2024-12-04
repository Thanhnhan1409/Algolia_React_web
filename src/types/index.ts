
export type Category = {
  key: number
  title: string
  value: number
  children?: Category[]
}

export type Product = {
  key: number
  name: string
  price: number
  image: string
  rating: number
  brand: string
  description: string
  categories: string[]
  freeShipping: boolean
}

export type Filter = {
  search?: string
  category?: string
  priceRange?: number[],
  rating?: number
  brand?: string[]
  freeShipping?: boolean
}

export type Brand = {
  label: string
  value: string
}
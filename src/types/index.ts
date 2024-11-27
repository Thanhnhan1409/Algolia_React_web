export type ICard = {
  image?: string
  url?: string
  name?: string
  rating?: number
  price: number
  description: string
  categories: string[]
}

export type ICategory = {
  key: number
  title: string
  value: number
  children?: ICategory[]
}
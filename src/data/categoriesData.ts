import { Category } from "../types";

export const categories: Category[] = [
  {
    key: 1,
    title: "Beauty & Personal Care",
    value: 12,
    children: [
      {
        key: 11,
        title: "Makeup",
        value: 6,
      },
      {
        key: 12,
        title: "Skin Care",
        value: 6,
      },
    ]
  },
  {
    key: 2,
    title: "Books",
    value: 4,
    children: [
      {
        key: 21,
        title: "Fiction",
        value: 2,
      },
      {
        key: 22,
        title: "Non-Fiction",
        value: 2,
      },
    ]
  },
  {
    key: 3,
    title: "Electronics",
    value: 8,
    children: [
      {
        key: 31,
        title: "Computers",
        value: 4,
      },
      {
        key: 32,
        title: "Smartphones",
        value: 4,
      },
    ]
  },
  {
    key: 4,
    title: "Fashion",
    value: 10,
    children: [
      {
        key: 41,
        title: "Clothing",
        value: 5,
      },
      {
        key: 42,
        title: "Shoes",
        value: 5,
      },
    ]
  },
  {
    key: 5,
    title: "Home & Kitchen",
    value: 6,
    children: [
      {
        key: 51,
        title: "Appliances",
        value: 3,
      },
      {
        key: 52,
        title: "Cookware",
        value: 3,
      },
    ]
  },
  {
    key: 6,
    title: "Sports & Outdoors",
    value: 7,
    children: [
      {
        key: 61,
        title: "Fitness",
        value: 4,
      },
      {
        key: 62,
        title: "Camping",
        value: 3,
      },
    ]
  },
  {
    key: 7,
    title: "Toys & Games",
    value: 5,
    children: [
      {
        key: 71,
        title: "Board Games",
        value: 3,
      },
      {
        key: 72,
        title: "Outdoor Games",
        value: 2,
      },
    ]
  },
]
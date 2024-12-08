import { Filter } from "../types";

export const initializeQueryFilter = (): Filter => {
  const params = new URLSearchParams(window.location.search);
  const priceGte = params.get("price_gte");
  const priceLte = params.get("price_lte");
  const rating = params.get("rating");
  const sort = params.get("sort");
  const freeShipping = params.get("free_shipping") === "true";
  const brand = params.getAll("brand");
  const category = params.get("category");
  const search = params.get("search");

  return {
    priceRange: priceGte && priceLte ? [Number(priceGte), Number(priceLte)] : undefined,
    rating: rating ? Number(rating) : undefined,
    sort: sort || undefined,
    freeShipping,
    brand: brand.length ? brand : undefined,
    category: category || undefined,
    search: search || undefined,
  };
};

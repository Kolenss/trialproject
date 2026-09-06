const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export interface Product {
  code: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  nutrients: {
    energyKcal: number | null;
    fat: number | null;
    saturatedFat: number | null;
    carbohydrates: number | null;
    sugars: number | null;
    fiber: number | null;
    proteins: number | null;
    salt: number | null;
  } | null;
}

export interface SearchResponse {
  products: Product[];
  total: number;
  page: number;
  hasSubscription: boolean;
}

export interface RecentSearch {
  id: number;
  query: string;
  language: string;
  createdAt: string;
}

export interface UserInfo {
  id: number;
  email: string;
  subscriptionStatus: string;
}

export async function searchProducts(
  query: string,
  lang: string,
  page: number = 1
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, lang, page: String(page) });
  const res = await fetch(`${API_URL}/products/search?${params}`);
  if (!res.ok) throw new Error("Failed to search products");
  return res.json();
}

export async function saveSearch(query: string, language: string): Promise<void> {
  await fetch(`${API_URL}/searches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, language }),
  });
}

export async function getRecentSearches(): Promise<RecentSearch[]> {
  const res = await fetch(`${API_URL}/searches/recent`);
  if (!res.ok) return [];
  return res.json();
}

export async function getUserInfo(): Promise<UserInfo> {
  const res = await fetch(`${API_URL}/user/me`);
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function createCheckoutSession(): Promise<string> {
  const res = await fetch(`${API_URL}/stripe/create-checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to create checkout session");
  const data = await res.json();
  return data.url;
}

import { API_ENDPOINTS } from "@/lib/constants";
import type { Category } from "@/types/product";

interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

/** For use in Server Components; fetches category by slug. */
export async function fetchCategoryBySlug(
  slug: string,
  options?: { next?: { revalidate?: number | false; tags?: string[] } }
): Promise<Category | null> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const url = `${base}${API_ENDPOINTS.CATEGORY_BY_SLUG}/${encodeURIComponent(slug)}`;
  console.log("123url", url);
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    next: options?.next,
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Category fetch failed: ${res.status} ${res.statusText}`);
  }

  const body: ServiceResponse<Category & { images?: string[] }> =
    await res.json();
  if (!body.success || !body.data) return null;

  const raw = body.data as {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    images?: string[];
    createdAt?: string;
    updatedAt?: string;
  };
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description ?? null,
    images: Array.isArray(raw.images) ? raw.images : null,
    created_at: raw.createdAt ?? "",
    updated_at: raw.updatedAt ?? "",
  };
}

import { API_ENDPOINTS } from "@/lib/constants";
import { apiClient } from "@/lib/fetcher";
import type { Product, Variant } from "@/types/product";

/** Backend returns product with camelCase and nested variants */
interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

interface ApiVariant {
  id: string;
  productId: string;
  name: string;
  description: string | null;
  price: number | null;
  stock: number | null;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  productType: "in_stock" | "preorder";
  price: number | null;
  stock: number | null;
  currency: string;
  priceNote: string | null;
  shippingNote: string | null;
  viewCount: number;
  sellerName: string;
  sizeDescription: string | null;
  packageDescription: string | null;
  preorderDescription: string | null;
  images: string[];
  preorder: { start_date?: string; end_date?: string } | null;
  createdAt: string;
  updatedAt: string;
  variants: ApiVariant[];
}

function mapApiProductToProduct(api: ApiProduct): Product {
  const preorder = api.preorder as {
    start_date?: string;
    end_date?: string;
  } | null;
  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    category_id: api.categoryId ?? null,
    product_type: api.productType,
    price: api.price ?? 0,
    currency: api.currency ?? "VND",
    price_note: api.priceNote ?? null,
    shipping_note: api.shippingNote ?? null,
    stock: api.stock ?? 0,
    seller_name: api.sellerName ?? null,
    size_description: api.sizeDescription ?? null,
    package_description: api.packageDescription ?? null,
    preorder_description: api.preorderDescription ?? null,
    images: Array.isArray(api.images) ? api.images : [],
    view_count: api.viewCount ?? 0,
    preorder:
      preorder && (preorder.start_date != null || preorder.end_date != null)
        ? {
            start_date: preorder.start_date ?? "",
            end_date: preorder.end_date ?? "",
          }
        : null,
    created_at: api.createdAt,
    updated_at: api.updatedAt,
  };
}

function mapApiVariantToVariant(api: ApiVariant, index: number): Variant {
  return {
    id: api.id,
    product_id: api.productId,
    name: api.name,
    description: api.description ?? null,
    price: api.price ?? null,
    stock: api.stock ?? null,
    images: api.images?.length ? api.images : null,
    display_order: index,
    created_at: api.createdAt,
    updated_at: api.updatedAt,
  };
}

export interface ProductDetailResult {
  product: Product;
  variants: Variant[];
}

export type ProductSort = "newest" | "price_asc" | "price_desc" | "name_asc";

export interface ProductListParams {
  category_id?: string;
  page?: number;
  limit?: number;
  sort?: ProductSort;
  keyword?: string;
}

export interface ProductListResult {
  data: Product[];
  total: number;
}

/** For use in Server Components; fetches paginated products (e.g. by category). */
export async function fetchProductList(
  params: ProductListParams,
  options?: { next?: { revalidate?: number | false; tags?: string[] } }
): Promise<ProductListResult> {
  const searchParams = new URLSearchParams();
  if (params.category_id) searchParams.set("category_id", params.category_id);
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.limit != null) searchParams.set("limit", String(params.limit));
  if (params.sort) searchParams.set("sort", params.sort);
  if (params.keyword) searchParams.set("keyword", params.keyword);

  const base = process.env.NEXT_PUBLIC_API_URL;
  const url = `${base}${API_ENDPOINTS.PRODUCT}?${searchParams.toString()}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    next: options?.next,
  });

  if (!res.ok) {
    throw new Error(
      `Product list fetch failed: ${res.status} ${res.statusText}`
    );
  }

  const body: ServiceResponse<{ data: ApiProduct[]; total: number }> =
    await res.json();
  if (!body.success || !body.data) {
    return { data: [], total: 0 };
  }

  const { data: list, total } = body.data;
  return {
    data: (list ?? []).map(mapApiProductToProduct),
    total: total ?? 0,
  };
}

export const productApi = {
  async getProductBySlug(slug: string): Promise<ProductDetailResult> {
    const res = await apiClient.get<ServiceResponse<ApiProduct>>(
      `${API_ENDPOINTS.PRODUCT_DETAIL}/${encodeURIComponent(slug)}`
    );
    const body = res.data;
    if (!body.success || !body.data) {
      throw new Error(body.message ?? "Failed to load product");
    }
    const apiProduct = body.data;
    const product = mapApiProductToProduct(apiProduct);
    const variants = (apiProduct.variants ?? []).map((v, i) =>
      mapApiVariantToVariant(v, i)
    );
    variants.sort((a, b) => a.display_order - b.display_order);
    return { product, variants };
  },
};

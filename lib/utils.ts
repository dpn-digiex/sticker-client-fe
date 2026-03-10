import { Product } from "@/types/product";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const cartItemIdOf = (productId: string, variantId?: string) =>
  `${productId}::${variantId ?? "default"}`;

export const clampQty = (n: number) =>
  Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1;

export const getUnitPrice = (item: {
  campaignPrice?: number;
  price?: number;
}) => item.campaignPrice ?? item.price ?? 0;

export const formatVND = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

export function isPreorderExpired(p: Product) {
  if (p.product_type !== "preorder" || !p.preorder?.end_date) return false;
  const end = new Date(p.preorder.end_date);
  // compare with current time (server time)
  return end.getTime() < Date.now();
}

export function isSoldOutProduct(p: Product) {
  // in_stock or preorder with stock <= 0, or preorder expired
  if (p.product_type) return (p.stock ?? 0) <= 0;
  return isPreorderExpired(p);
}

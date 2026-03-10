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

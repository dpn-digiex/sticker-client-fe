/** Payload for POST /orders - matches backend CreateOrderBody */
export interface CreateOrderPayload {
  contact: {
    social_link: string;
    email: string;
    phone: string;
  };
  shippingInfo: {
    receiver_name: string;
    receiver_phone?: string;
    address: string;
    notes?: string | null;
  };
  payment: {
    plan_type: "full" | "deposit";
    method: string;
    bill_image?: string | null;
  };
  promotionId?: string | null;
  promotionSnapshot?: Record<string, unknown> | null;
  items: Array<{
    productId: string;
    variantId?: string | null;
    quantity: number;
  }>;
}

/** Backend service response wrapper */
export interface ApiServiceResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

/** Order as returned from API (camelCase) */
export interface OrderCreatedData {
  id: string;
  status: string;
  createdAt: string;
  contact: Record<string, unknown>;
  shippingInfo: Record<string, unknown>;
  payment: Record<string, unknown>;
  promotionId: string | null;
  promotionSnapshot: Record<string, unknown> | null;
  items: Array<{
    id: string;
    productId: string;
    variantId: string | null;
    quantity: number;
  }>;
}

export type CreateOrderResponse = ApiServiceResponse<OrderCreatedData>;

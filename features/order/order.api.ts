import { apiClient } from "@/lib/fetcher";
import { API_ENDPOINTS } from "@/lib/constants";
import type {
  CreateOrderPayload,
  CreateOrderResponse,
  ApiServiceResponse,
  OrderCreatedData,
} from "./order.types";

export const orderApi = {
  async createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
    const { data } = await apiClient.post<ApiServiceResponse<OrderCreatedData>>(
      API_ENDPOINTS.ORDERS,
      payload
    );
    return data;
  },
};

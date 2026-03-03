import { apiClient } from "@/lib/fetcher";
import type { HomepageApiResponse, HomepageCategory } from "./homepage.types";

export const homepageApi = {
  /**
   * Fetches categories with products for the store homepage.
   * Categories are sorted by createdAt; each category has up to 20 products (sorted by createdAt).
   */
  async getHomepage(): Promise<HomepageCategory[]> {
    const { data } = await apiClient.get<HomepageApiResponse>("/homepage");
    if (!data.success || !data.data) {
      throw new Error(data.message ?? "Failed to load homepage data");
    }
    return data.data;
  },
};

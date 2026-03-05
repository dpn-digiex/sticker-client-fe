import type { Metadata } from "next";
import Link from "next/link";
import { fetchHomepage } from "@/features/homepage/homepage.api";
import type { HomepageCategory } from "@/features/homepage/homepage.types";
import { ProductCarousel } from "@/components/common/ProductCarousel";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dango's Corner – Order K-pop, Doll & Handmade Merch",
  description:
    "Dango's Corner chuyên nhận order K-pop, doll, merch, sticker handmade từ Taobao, PDD, Douyin, XHS. Nhận pre-order & order theo yêu cầu.",
  keywords: [
    "order kpop",
    "preorder doll",
    "kpop merch",
    "sticker handmade",
    "order taobao",
    "order pdd",
    "order douyin",
  ],
  openGraph: {
    title: "Dango's Corner – K-pop & Handmade Merch",
    description:
      "Order K-pop, doll, merch, sticker handmade. Nhận pre-order và order theo yêu cầu.",
    url: "https://dangoscorner.com",
    siteName: "Dango's Corner",
    type: "website",
  },
};

const PLACEHOLDER_IMAGE =
  "https://d20m1ujgrryo2d.cloudfront.net/placeholder.png";

export default async function HomePage() {
  let categories: HomepageCategory[];
  try {
    categories = await fetchHomepage({
      next: { revalidate: 60 }, // 1 minute
    });
  } catch (error) {
    console.error("error", error);
    categories = [];
  }

  return (
    <main className="bg-background">
      {/* HERO / SEARCH */}
      <section className="container mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Sản phẩm K-pop, Doll & Handmade Merch
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
          Nhận order K-pop, C-pop, Anime, doll, sticker handmade từ Taobao, PDD,
          Douyin, XHS. Hỗ trợ pre-order và order theo yêu cầu.
        </p>

        {/* Search (indexable placeholder) */}
        <form
          action={ROUTES.PRODUCT}
          className="mt-8 flex justify-center"
          role="search"
        >
          <input
            type="search"
            name="q"
            placeholder="Tìm kiếm sản phẩm, artist, danh mục..."
            className="w-full max-w-xl rounded-xl border border-border bg-card px-4 py-3 text-sm"
          />
        </form>
      </section>
      {categories.map(category => (
        <section
          key={category.id}
          className="container mx-auto p-8"
          aria-labelledby={category.slug}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 id={category.slug} className="text-2xl font-semibold">
              {category.name}
            </h2>

            <Link
              href={`${ROUTES.CATEGORY}/${category.slug}`}
              className="text-sm nav-link"
            >
              Xem thêm →
            </Link>
          </div>

          <ProductCarousel
            products={category.products}
            placeholderImage={PLACEHOLDER_IMAGE}
          />
        </section>
      ))}
    </main>
  );
}

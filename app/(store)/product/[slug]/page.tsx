import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { Product } from "@/types/product";
import ProductCartControls from "@/components/common/ProductCartControls";
import { PreorderCountdown } from "@/components/common/PreorderCountdown";
import { ProductImageSlider } from "@/components/common/ProductImageSlider";
import { productApi } from "@/features/product/product.api";
import { PLACEHOLDER_IMAGE, ROUTES } from "@/lib/constants";

async function getRelatedProductsByCategory(
  categoryId: string | null,
  _excludeProductId: string
): Promise<Product[]> {
  if (!categoryId) return [];
  // TODO: replace with real API when list-by-category or related endpoint exists
  return [];
}

function isPreorderExpired(p: Product) {
  if (p.product_type !== "preorder" || !p.preorder?.end_date) return false;
  const end = new Date(p.preorder.end_date);
  // so sánh theo thời gian hiện tại (server time)
  return end.getTime() < Date.now();
}

function isSoldOut(p: Product) {
  // in_stock mà stock <= 0, hoặc preorder hết hạn
  if (p.product_type === "in_stock") return (p.stock ?? 0) <= 0;
  return isPreorderExpired(p);
}

function formatVND(amount: number) {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

// ✅ SEO: dynamic metadata by slug/product
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  let result;
  try {
    result = await productApi.getProductBySlug(slug);
  } catch {
    return { title: "Product Not Found" };
  }
  const { product } = result;

  const title = `${product.name} – Dango Corner`;
  const description =
    product.shipping_note ||
    product.preorder_description ||
    product.size_description ||
    "Chi tiết sản phẩm tại Dango Corner.";

  return {
    title,
    description,
    alternates: {
      canonical: `${ROUTES.PRODUCT}/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let result;
  try {
    result = await productApi.getProductBySlug(slug);
  } catch {
    notFound();
  }
  const { product, variants } = result!;

  const relatedProducts = await getRelatedProductsByCategory(
    product.category_id,
    product.id
  );

  const isPreorder = product.product_type === "preorder";

  const isIncludedDescription =
    product.size_description ||
    product.package_description ||
    product.preorder_description ||
    product.shipping_note;

  const isShowPreorderCountdown =
    isPreorder && product.preorder?.start_date && product.preorder?.end_date;

  return (
    <main className="bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb / Back */}
        <div className="mb-6">
          <Link
            href={ROUTES.PRODUCT}
            className="nav-link inline-flex items-center gap-2"
          >
            ← Quay lại
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* LEFT: Gallery */}
          <section
            aria-label="Hình ảnh sản phẩm"
            className="rounded-2xl border border-border bg-card p-4"
          >
            <ProductImageSlider
              images={product.images ?? []}
              productName={product.name}
              placeholderImage={PLACEHOLDER_IMAGE}
            />
          </section>

          {/* RIGHT: Info */}
          <section aria-label="Thông tin sản phẩm" className="space-y-5">
            {/* badges */}
            <div className="flex items-center gap-2">
              {isPreorder && (
                <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-semibold text-foreground">
                  Pre-order
                </span>
              )}
              {!isPreorder && product.stock > 0 && (
                <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-foreground">
                  In stock
                </span>
              )}
            </div>

            {/* ✅ SEO: H1 product name */}
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                👁️ {product.view_count.toLocaleString("vi-VN")} lượt xem
              </span>
              {product.seller_name && (
                <span>Master: {product.seller_name}</span>
              )}
            </div>

            {/* price block */}
            <div className="rounded-2xl border border-border bg-card px-6 py-4">
              <div className="flex items-end gap-2">
                <div className="text-3xl font-bold text-primary">
                  {formatVND(product.price)}
                </div>
                {product.price_note && (
                  <div className="pb-1 text-sm text-muted-foreground">
                    • {product.price_note}
                  </div>
                )}
              </div>
            </div>

            {/* preorder countdown */}
            {isShowPreorderCountdown && (
              <PreorderCountdown
                endDate={product.preorder?.end_date ?? ""}
                startDate={product.preorder?.start_date ?? ""}
              />
            )}

            {/* details table */}
            {isIncludedDescription && (
              <div className="rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-sm font-semibold text-foreground">
                    Mô tả
                  </h2>
                </div>

                <dl className="divide-y divide-border">
                  {product.size_description && (
                    <div className="grid grid-cols-3 gap-4 px-5 py-4">
                      <dt className="text-sm text-muted-foreground">
                        Kích thước
                      </dt>
                      <dd className="col-span-2 text-sm text-foreground">
                        {product.size_description}
                      </dd>
                    </div>
                  )}
                  {product.package_description && (
                    <div className="grid grid-cols-3 gap-4 px-5 py-4">
                      <dt className="text-sm text-muted-foreground">Bao gồm</dt>
                      <dd className="col-span-2 text-sm text-foreground">
                        {product.package_description}
                      </dd>
                    </div>
                  )}
                  {product.preorder_description && (
                    <div className="grid grid-cols-3 gap-4 px-5 py-4">
                      <dt className="text-sm text-muted-foreground">
                        Thời gian SX
                      </dt>
                      <dd className="col-span-2 text-sm text-foreground">
                        {product.preorder_description}
                      </dd>
                    </div>
                  )}
                  {product.shipping_note && (
                    <div className="grid grid-cols-3 gap-4 px-5 py-4">
                      <dt className="text-sm text-muted-foreground">Ghi chú</dt>
                      <dd className="col-span-2 text-sm text-foreground">
                        {product.shipping_note}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Variant selector & Add to cart (CLIENT) */}
            <ProductCartControls
              product={product}
              variants={variants}
              basePrice={product.price}
            />
          </section>
        </div>

        {/* ✅ SEO: internal links section */}
        <section className="container mx-auto px-0 pt-10 flex flex-col items-center text-center">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Xem thêm sản phẩm khác
          </h2>
          <div className="mt-4">
            <Link href={ROUTES.PRODUCT} className="nav-link">
              Đi đến danh sách sản phẩm →
            </Link>
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section
            className="mt-12 border-t border-border pt-10"
            aria-labelledby="related-products"
          >
            <h2
              id="related-products"
              className="text-xl font-semibold text-foreground"
            >
              Sản phẩm cùng loại
            </h2>

            <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
              {relatedProducts.map(p => {
                const soldOut = isSoldOut(p);

                return (
                  <Link
                    key={p.id}
                    href={`${ROUTES.PRODUCT}/${p.slug}`}
                    className="group relative min-w-[220px] max-w-[220px] rounded-2xl border border-border bg-card p-3 transition hover:border-primary/40"
                  >
                    {/* image */}
                    <div className="relative aspect-square overflow-hidden rounded-xl">
                      <Image
                        src={p.images?.[0] ?? PLACEHOLDER_IMAGE}
                        alt={p.name}
                        fill
                        sizes="220px"
                        className={
                          soldOut ? "object-cover opacity-60" : "object-cover"
                        }
                      />

                      {/* Sold out badge (like screenshot “Hết hạn”) */}
                      {soldOut && (
                        <span className="absolute left-3 top-3 rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold text-white">
                          Hết hạn
                        </span>
                      )}
                    </div>

                    {/* content */}
                    <div className="mt-3 space-y-2">
                      <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
                        {p.name}
                      </h3>

                      <p className="text-base font-semibold text-primary">
                        {formatVND(p.price)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ✅ SEO: Product JSON-LD */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.name,
              image: product.images,
              offers: {
                "@type": "Offer",
                priceCurrency: product.currency,
                price: product.price,
                availability:
                  product.stock > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",
                url: `${ROUTES.PRODUCT}/${product.slug}`,
              },
            }),
          }}
        />
      </div>
    </main>
  );
}

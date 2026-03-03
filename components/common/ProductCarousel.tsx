"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { HomepageProduct } from "@/features/homepage/homepage.types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ROUTES } from "@/lib/constants";

interface ProductCarouselProps {
  products: HomepageProduct[];
  placeholderImage: string;
}

export function ProductCarousel({
  products,
  placeholderImage,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollPrev(scrollLeft > 0);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    el.addEventListener("scroll", updateScrollState);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", updateScrollState);
    };
  }, [updateScrollState, products.length]);

  const scrollBy = useCallback((direction: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  }, []);

  if (products.length === 0) return null;

  return (
    <div className="relative group">
      {/* Prev */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-2 rounded-full shadow-md opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-0 md:-translate-x-4 md:opacity-100 md:hover:scale-105 cursor-pointer hover:scale-105"
        onClick={() => scrollBy(-1)}
        disabled={!canScrollPrev}
        aria-label="Xem trước"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Scroll area */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-hidden overflow-y-hidden py-2 pl-1 pr-1 scroll-smooth md:px-2 [scrollbar-width:thin]"
        style={{ scrollbarGutter: "stable" }}
      >
        {products.map(product => (
          <article
            key={product._id}
            className="min-w-[180px] w-[180px] flex-shrink-0 rounded-xl bg-card p-3"
          >
            <Link href={`${ROUTES.PRODUCT}/${product.slug}`} className="block">
              <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-muted">
                <Image
                  src={product.thumbnail || placeholderImage}
                  alt={product.name}
                  fill
                  sizes="180px"
                  className="object-cover"
                />
              </div>
              <h3 className="mt-2 text-sm font-medium line-clamp-2">
                {product.name}
              </h3>
              <p className="mt-1 text-sm text-primary">
                {product.price != null
                  ? `${product.price.toLocaleString()}đ`
                  : "Liên hệ"}
              </p>
            </Link>
          </article>
        ))}
      </div>

      {/* Next */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 rounded-full shadow-md opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-0 md:translate-x-4 md:opacity-100 md:hover:scale-105 cursor-pointer hover:scale-105"
        onClick={() => scrollBy(1)}
        disabled={!canScrollNext}
        aria-label="Xem tiếp"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

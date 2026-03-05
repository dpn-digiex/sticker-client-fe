"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Tag, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCartStore, formatVND, getUnitPrice } from "@/stores/cart.store";
import { useCheckoutStore } from "@/stores/checkout.store";
import { PAYMENT_METHOD, PLACEHOLDER_IMAGE, ROUTES } from "@/lib/constants";
import type { CartItem } from "@/types/cart";
import { PaymentMethod } from "@/types/order";

// Placeholder bank transfer info (replace with real config/API)
const BANK_TRANSFER = {
  accountHolder: "BUI THANH NHU Y",
  bank: "VPBank",
  accountNumber: "0395939035",
};

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore(s => s.items);
  const subtotal = useCartStore(s => s.getSubtotal());
  const {
    contact_info,
    shipping_info,
    promotion_code,
    payment_info,
    setContactInfo,
    setShippingInfo,
    setPromotionCode,
    setPaymentInfo,
  } = useCheckoutStore();

  const [socialLink, setSocialLink] = useState(contact_info?.social_link ?? "");
  const [email, setEmail] = useState(contact_info?.email ?? "");
  const [phone, setPhone] = useState(contact_info?.phone ?? "");
  const [receiverName, setReceiverName] = useState(
    shipping_info?.receiver_name ?? ""
  );
  const [receiverPhone, setReceiverPhone] = useState(
    shipping_info?.receiver_phone ?? ""
  );
  const [address, setAddress] = useState(shipping_info?.address ?? "");
  const [notes, setNotes] = useState(shipping_info?.notes ?? "");
  const [discountCode, setDiscountCode] = useState(promotion_code ?? "");
  const [paymentPlan, setPaymentPlan] = useState<"full" | "deposit">(
    payment_info?.plan_type ?? "full"
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    payment_info?.method ?? PAYMENT_METHOD.BANK_TRANSFER
  );
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      router.replace(ROUTES.HOME);
    }
  }, [items.length, router]);

  const copyBankInfo = () => {
    const text = `Chủ tài khoản: ${BANK_TRANSFER.accountHolder}\nNgân hàng/Ví: ${BANK_TRANSFER.bank}\nSố tài khoản: ${BANK_TRANSFER.accountNumber}`;
    void navigator.clipboard.writeText(text);
  };

  const onBillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBillFile(file);
      setBillPreview(URL.createObjectURL(file));
    } else {
      setBillFile(null);
      setBillPreview(null);
    }
  };

  const depositAmount = Math.floor(subtotal * 0.5);
  const total = paymentPlan === "deposit" ? depositAmount : subtotal;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactInfo({ social_link: socialLink, email, phone });
    setShippingInfo({
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      address,
      notes: notes || undefined,
    });
    setPromotionCode(discountCode || null);
    setPaymentInfo({
      plan_type: paymentPlan,
      method: paymentMethod as PaymentMethod,
      bill_image: billPreview ?? null,
    });
    // TODO: call order API, then redirect to order confirmation
  };

  if (items.length === 0) return null;

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-6 md:py-8">
        <Link
          href={ROUTES.HOME}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          ← Tiếp tục mua sắm
        </Link>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">
              Thông tin liên hệ
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Link Facebook / Instagram{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  type="url"
                  placeholder="https://..."
                  value={socialLink}
                  onChange={e => setSocialLink(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Email <span className="text-destructive">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Số điện thoại <span className="text-destructive">*</span>
                </label>
                <Input
                  type="tel"
                  placeholder="090..."
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">
              Thông tin nhận hàng
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Họ và tên người nhận{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Nguyễn Văn A"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Số điện thoại nhận hàng
                </label>
                <Input
                  type="tel"
                  placeholder="090..."
                  value={receiverPhone}
                  onChange={e => setReceiverPhone(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Địa chỉ nhận hàng <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="Số nhà, đường, phường, quận, thành phố (đơn vị hành chính cũ)"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Ghi chú (Tùy chọn)
                </label>
                <textarea
                  placeholder="Ví dụ: Giao ngoài giờ hành chính, gọi trước khi giao..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={3}
                  className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </section>

          {/* Cart summary */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground">Giỏ hàng</h2>
            <ul className="mt-4 space-y-3">
              {items.map(item => (
                <CheckoutLineItem key={item.cartItemId} item={item} />
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Mã giảm giá
              </span>
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder="Nhập mã giảm giá"
                value={discountCode}
                onChange={e => setDiscountCode(e.target.value)}
                className="rounded-xl"
              />
              <Button type="button" variant="secondary" className="rounded-xl">
                Áp dụng
              </Button>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính:</span>
              <span className="font-medium">{formatVND(subtotal)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-semibold text-primary">
              <span>Tổng cộng:</span>
              <span>{formatVND(total)}</span>
            </div>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground">Thanh toán</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Hình thức thanh toán
            </p>
            <div className="mt-4 space-y-3">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-4">
                <input
                  type="radio"
                  name="plan"
                  checked={paymentPlan === "full"}
                  onChange={() => setPaymentPlan("full")}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">
                  Thanh toán đủ 100% ({formatVND(subtotal)})
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-4">
                <input
                  type="radio"
                  name="plan"
                  checked={paymentPlan === "deposit"}
                  onChange={() => setPaymentPlan("deposit")}
                  className="h-4 w-4"
                />
                <span className="text-sm font-medium">
                  Đặt cọc 50% ({formatVND(depositAmount)}) - Hẹn hoàn cọc trong
                  1 tháng
                </span>
              </label>
            </div>

            <p className="mt-6 text-sm font-medium text-foreground">
              Chọn phương thức thanh toán
            </p>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="mt-2 rounded-xl">
                <SelectValue placeholder="Chọn phương thức" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PAYMENT_METHOD.BANK_TRANSFER}>
                  Chuyển khoản
                </SelectItem>
                <SelectItem value={PAYMENT_METHOD.MOMO}>Momo</SelectItem>
                <SelectItem value={PAYMENT_METHOD.ZALOPAY}>ZaloPay</SelectItem>
              </SelectContent>
            </Select>

            {paymentMethod === PAYMENT_METHOD.BANK_TRANSFER && (
              <>
                <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 text-sm">
                      <p>
                        Chủ tài khoản:{" "}
                        <span className="font-semibold">
                          {BANK_TRANSFER.accountHolder}
                        </span>
                      </p>
                      <p>
                        Ngân hàng/Ví:{" "}
                        <span className="font-semibold">
                          {BANK_TRANSFER.bank}
                        </span>
                      </p>
                      <p>
                        Số tài khoản:{" "}
                        <span className="font-semibold">
                          {BANK_TRANSFER.accountNumber}
                        </span>
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 rounded-lg"
                      onClick={copyBankInfo}
                    >
                      <Copy className="mr-1 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border-2 border-dashed border-pink-300 bg-pink-50/50 p-4 dark:border-pink-700 dark:bg-pink-950/20">
                  <label className="block text-sm font-medium text-foreground">
                    Đăng bill chuyển khoản{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={onBillChange}
                    className="mt-2 rounded-xl border-border file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:text-primary-foreground"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    * Bắt buộc gửi bill trước khi bấm đặt hàng ngay
                  </p>
                </div>
              </>
            )}
          </section>

          <Button
            type="submit"
            className="h-14 w-full rounded-2xl bg-primary text-lg font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Đặt hàng ngay
          </Button>
        </form>
      </div>
    </div>
  );
}

function CheckoutLineItem({ item }: { item: CartItem }) {
  const img = item.image ?? PLACEHOLDER_IMAGE;
  const price = getUnitPrice(item);
  const lineTotal = price * item.quantity;

  return (
    <li className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        <Image
          src={img}
          alt={item.productName ?? "Product"}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          <span className="text-muted-foreground">x{item.quantity}</span>{" "}
          {item.productName ?? "Sản phẩm"}
        </p>
        {item.variantName && (
          <p className="text-xs text-muted-foreground">{item.variantName}</p>
        )}
      </div>
      <p className="text-sm font-bold text-primary">{formatVND(lineTotal)}</p>
    </li>
  );
}

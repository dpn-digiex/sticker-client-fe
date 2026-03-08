"use client";
const notices = [
  "🚚 Hàng order bay từ Trung về, thường mất khoảng 5–15 ngày 🚚",
  "🍡 Hàng pre-order chế tác hơi lâu, kiên nhẫn chút nha bạn iu 🍡",
  "🫡 Chơi sticker đến hơi thở cuối cùng cùng Dango nhoé 🫡",
  "✨ Ví tiền có thể mỏng đi, nhưng bộ sưu tập sticker thì phải ngày càng dày lên ✨",
];

export function HeaderNotification() {
  return (
    <div className="sticky top-16 z-40 h-9 w-full bg-accent overflow-hidden">
      <div className="relative flex h-full items-center">
        <div className="animate-marquee flex w-max items-center gap-24 px-8">
          {notices.map((notice, i) => (
            <NoticeItem key={`a-${i}`}>{notice}</NoticeItem>
          ))}
          {/* duplicate for seamless loop */}
          {notices.map((notice, i) => (
            <NoticeItem key={`b-${i}`}>{notice}</NoticeItem>
          ))}
        </div>
      </div>
    </div>
  );
}

function NoticeItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap text-sm font-medium text-foreground">
      {children}
    </span>
  );
}

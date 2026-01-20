export interface OperatingHours {
  open: string;
  close: string;
  is_closed: boolean;
}

export interface ShopStatus {
  isOpen: boolean;
  message: string;
}

export function isShopOpen(shop: any): ShopStatus {
  if (!shop) return { isOpen: false, message: "Toko tidak ditemukan" };

  // 1. Check manual override
  if (shop.is_manual_closed) {
    return { isOpen: false, message: "Toko sedang tutup (Manual)" };
  }

  // 2. Check operating hours
  if (!shop.operating_hours) {
    return { isOpen: true, message: "Buka" }; // Default to open if no schedule
  }

  const now = new Date();
  // Adjust to local time if needed, but standard Date works for current user context
  const days = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const currentDay = days[now.getDay()];
  const schedule = (shop.operating_hours as Record<string, OperatingHours>)[
    currentDay
  ];

  if (!schedule) {
    return { isOpen: true, message: "Buka" };
  }

  if (schedule.is_closed) {
    return { isOpen: false, message: "Toko tutup hari ini" };
  }

  const currentTime = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = schedule.open.split(":").map(Number);
  const [closeH, closeM] = schedule.close.split(":").map(Number);

  const openTime = openH * 60 + openM;
  const closeTime = closeH * 60 + closeM;

  if (currentTime < openTime) {
    return { isOpen: false, message: `Buka pukul ${schedule.open}` };
  }

  if (currentTime > closeTime) {
    return {
      isOpen: false,
      message: `Sudah tutup (Buka pukul ${schedule.open} besok)`,
    };
  }

  return { isOpen: true, message: "Buka" };
}

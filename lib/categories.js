import {
  Utensils,
  Wifi,
  IceCreamCone,
  HandHeart,
  Receipt,
  Laptop,
  Gift,
  Plus,
} from "lucide-react";

// Expense categories — these match how the money actually leaves your hand.
export const EXPENSE_CATEGORIES = [
  { id: "food", label: "Food", icon: Utensils, color: "var(--color-cat-food)" },
  { id: "data", label: "Data", icon: Wifi, color: "var(--color-cat-data)" },
  { id: "misc", label: "Misc", icon: IceCreamCone, color: "var(--color-cat-misc)" },
  { id: "giving", label: "Giving", icon: HandHeart, color: "var(--color-cat-giving)" },
  { id: "other", label: "Other", icon: Receipt, color: "var(--color-cat-other)" },
];

// Income sources — money coming in.
export const INCOME_SOURCES = [
  { id: "work", label: "Work", icon: Laptop, color: "var(--color-primary)" },
  { id: "gift", label: "Gift", icon: Gift, color: "var(--color-cat-giving)" },
  { id: "other_in", label: "Other", icon: Plus, color: "var(--color-cat-other)" },
];

const ALL = [...EXPENSE_CATEGORIES, ...INCOME_SOURCES];

export function categoriesFor(type) {
  return type === "income" ? INCOME_SOURCES : EXPENSE_CATEGORIES;
}

export function getCategory(id) {
  return ALL.find((c) => c.id === id) || { id, label: id, icon: Receipt, color: "var(--color-cat-other)" };
}

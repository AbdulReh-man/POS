import { createContext, useContext } from "react";

interface CategorySalesContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const CategorySalesContext =
  createContext<CategorySalesContextValue | null>(null);

export function useCategorySales() {
  const ctx = useContext(CategorySalesContext);
  if (!ctx) {
    throw new Error(
      "useCategorySales must be used within a CategorySalesProvider"
    );
  }
  return ctx;
}

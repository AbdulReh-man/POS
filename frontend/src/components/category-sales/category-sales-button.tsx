import { PieChart as PieChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategorySales } from "./category-sales-context";

// Drop this on any page rendered inside <CategorySalesProvider> to open the drawer.
export function CategorySalesButton({
  label = "Category Sales",
  variant = "outline",
  size = "lg",
}: {
  label?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  const { setOpen } = useCategorySales();
  return (
    <Button variant={variant} size={size} onClick={() => setOpen(true)}>
      <PieChartIcon className='h-4 w-4' /> {label}
    </Button>
  );
}

import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

export const ProductColumns: ColumnDef<Product>[] = [
  // select column
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
  },
  // name column
  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => {
      return (
        <div className='font-medium'>
          {row.getValue("name") === null ? "Unknown" : row.getValue("name")}
        </div>
      );
    },
  },
  // category name column
  {
    accessorKey: "category_name",
    header: () => {
      return <div>Category</div>;
    },
    cell: ({ row }) => {
      return (
        <div className=' font-medium'>
          {row.getValue("category_name") === null
            ? "Unknown"
            : row.getValue("category_name")}
        </div>
      );
    },
    maxSize: 10,
    size: 30,
  },
  // stock column
  {
    accessorKey: "stock",
    header: () => {
      return <div>Stock</div>;
    },
    cell: ({ row }) => {
      const getstock = row.getValue("stock") as number;
      if (getstock <= 10) {
        return <div className=' text-destructive'>{row.getValue("stock")}</div>;
      }
      return (
        <div className={`font-medium uppercase `}>{row.getValue("stock")}</div>
      );
    },
    maxSize: 10,
    size: 30,
  },
  // product type column
  {
    accessorKey: "product_type",
    header: () => {
      return <div>Product Type</div>;
    },
    cell: ({ row }) => {
      return (
        <div className=' font-medium uppercase'>
          {row.getValue("product_type") === null
            ? "Unknown"
            : row.getValue("product_type")}
        </div>
      );
    },
    maxSize: 10,
    size: 30,
  },
  // created at column (hidden)
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      const formatted = date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
      return <div className='font-medium'>{formatted}</div>;
    },
    filterFn: (row, id, value) => {
      if (!value?.from && !value?.to) return true;

      const date = new Date(row.getValue(id));
      const from = value?.from ? new Date(value.from) : null;
      const to = value?.to
        ? new Date(new Date(value.to).setHours(23, 59, 59, 999)) // ✅ include full end day
        : null;

      if (from && to) return date >= from && date <= to;
      if (from) return date >= from;
      if (to) return date <= to;
      return true;
    },
  },
  // price column
  {
    accessorKey: "price",
    header: () => <div>Price</div>,
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price);

      return <div className='font-medium'>{formatted}</div>;
    },
  },
  // cost price column
  {
    accessorKey: "cost_price",
    header: () => <div>Cost Price</div>,
    cell: ({ row }) => {
      const costPrice = parseFloat(row.getValue("cost_price"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(costPrice);

      return <div className='font-medium'>{formatted}</div>;
    },
  },
];

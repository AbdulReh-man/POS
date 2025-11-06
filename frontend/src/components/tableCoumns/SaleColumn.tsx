import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export const SalesColumns: ColumnDef<Sale>[] = [
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
  {
    accessorKey: "user_id",
    header: "User ID",
    cell: ({ row }) => {
      return (
        <div className='text-center font-medium'>
          {row.getValue("user_id") === null ? "Manager" : row.getValue("user_id")}
        </div>
      );
    },
  },
  {
    accessorKey: "invoice_number",
    header: () => {
      return <div className='text-center'>Invoice</div>;
    },
    cell: ({ row }) => {
      return (
        <div className='text-center font-medium'>
          {row.getValue("invoice_number")}
        </div>
      );
    },
    maxSize: 10,
    size: 30,
  },
  {
    accessorKey: "customer_id",
    header: () => {
      return <div className='text-center'>Customer</div>;
    },
    cell: ({ row }) => {
      return (
        <div className='text-center font-medium'>
          {row.getValue("customer_id") === null
            ? "Walk-in"
            : row.getValue("customer_id")}
        </div>
      );
    },
    maxSize: 10,
    size: 30,
  },
  {
    accessorKey: "payment_method",
    header: ({ column }) => {
      return (
        <div className='text-center'>
          <Button
            variant='ghost'
            onClick={() =>
              column.toggleSorting(column.getIsSorted() === "asc")
            }>
            Payment
            <ArrowUpDown className='ml-2 h-4 w-4 p-0' />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return (
        <div className='font-medium w-fit mx-auto'>
          {row.getValue("payment_method")}
        </div>
      );
    },
  },
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
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => {
      const discount = parseFloat(row.getValue("discount"));
      return <div className='font-medium'>{discount + "%"}</div>;
    },
  },
  {
    accessorKey: "total",
    header: () => <div className='text-center'>Total</div>,
    cell: ({ row }) => {
      const total = parseFloat(row.getValue("total"));
      return (
        <div className='text-center font-medium text-primary'>{total}</div>
      );
    },
  },
];

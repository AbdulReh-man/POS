import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { businessDateRangeFilter, parseDbDate } from "@/lib/businessDay";

export const TodaySaleColumns: ColumnDef<TodaySale>[] = [
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
    accessorKey: "invoice_number",
    header: () => {
      return <div className='text-center'>Invoice No</div>;
    },
    cell: ({ row }) => {
      return (
        <div className='text-center font-medium'>
          {row.getValue("invoice_number") }
        </div>
      );
    },
    maxSize: 10,
    size: 30,
  },
  {
    accessorKey: "customer_name",
    header: () => {
      return <div className='text-center'>Customer</div>;
    },
    cell: ({ row }) => {
      return (
        <div className='text-center font-medium'>
          {row.getValue("customer_name") === null
            ? "Walk-in"
            : row.getValue("customer_name")}
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
        <div className='font-medium w-fit mx-auto uppercase'>
          {row.getValue("payment_method")}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Sale Date",
    cell: ({ row }) => {
      const date = parseDbDate(row.getValue("created_at"));
      const formatted = date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "numeric",
        minute: "2-digit",
      });
      return <div className='font-medium'>{formatted}</div>;
    },
    filterFn: (row, id, value) =>
      businessDateRangeFilter(row.getValue(id), value),
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

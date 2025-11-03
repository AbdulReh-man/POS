import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";

export const ExpenseColumns: ColumnDef<Expense>[] = [
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
    accessorKey: "title",
    header: "Expense Title",
    cell: ({ row }) => {
      return (
        <div className='font-medium'>
          {row.getValue("title") === null ? "Unknown" : row.getValue("title")}
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: () => {
      return <div>Category</div>;
    },
    cell: ({ row }) => {
      return (
        <div className=' font-medium'>
          {row.getValue("category") === null
            ? "Unknown"
            : row.getValue("category")}
        </div>
      );
    },
    maxSize: 10,
    size: 30,
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
    accessorKey: "amount",
    header: () => <div>Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);

      return <div className=' font-medium'>{formatted}</div>;
    },
  },
];

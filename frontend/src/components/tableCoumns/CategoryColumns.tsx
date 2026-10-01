import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { businessDateRangeFilter, parseDbDate } from "@/lib/businessDay";

export const CategoryColumns: ColumnDef<Category>[] = [
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
    accessorKey: "name",
    header: "Category Name",
    cell: ({ row }) => {
      return (
        <div className='font-medium'>
          {row.getValue("name") === null ? "Unknown" : row.getValue("name")}
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: () => {
      return <div>Description</div>;
    },
    cell: ({ row }) => {
      return (
        <div className=' font-medium'>
          {row.getValue("description") === null
            ? "Unknown"
            : row.getValue("description")}
        </div>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => {
      const date = parseDbDate(row.getValue("created_at"));
      const formatted = date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      });
      return <div className='font-medium'>{formatted}</div>;
    },
    filterFn: (row, id, value) =>
      businessDateRangeFilter(row.getValue(id), value),
  },
];

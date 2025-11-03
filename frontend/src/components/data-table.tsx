import * as React from "react";
import { useState, useMemo } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CalendarIcon,
  ChevronDown,
  FileDown,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, subMonths } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { exportTableData } from "@/utils/exportData";
import { useIsMobile } from "@/hooks/use-mobile";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Types
interface EnumFilter {
  columnId: string;
  placeholder: string;
  label: string;
  options: Array<{ value: string; label: string }>;
}

interface DateRangeFilter {
  columnId: string;
  quickRanges?: Array<{ value: number; label: string }>;
}

interface ExportConfig {
  filename: string;
  formats?: Array<"xlsx" | "csv">;
}

interface ActionConfig<TData> {
  onEdit?: (row: TData) => void;
  onDelete?: (row: TData) => void;
  onView?: boolean;
  customActions?: Array<{
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: TData) => void;
    variant?: "default" | "destructive" | "outline" | "ghost";
  }>;
  // Drawer configuration
  viewDrawerConfig?: {
    title?: (row: TData) => string;
    description?: (row: TData) => string;
    excludeFields?: string[];
    fieldLabels?: Record<string, string>;
    imageField?: string;
    customContent?: (row: TData) => React.ReactNode;
  };
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  enumFilters?: EnumFilter[];
  dateRangeFilter?: DateRangeFilter;
  exportConfig?: ExportConfig;
  actions?: ActionConfig<TData>;
  FormComponent?: React.ComponentType;
  showColumnVisibility?: boolean;
  showPagination?: boolean;
  showRowSelection?: boolean;
  emptyMessage?: string;
}

const FormSchema = z.object({
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .optional(),
});

// Helper function to format field names
function formatFieldName(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim();
}

// Helper function to format field values
function formatFieldValue(value: string | number | boolean | Date | object | null | undefined): string {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return format(value, "PPP");
  if (typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value);
}

// Data Drawer Component
function DataDrawer<TData>({
  data,
  isOpen,
  onClose,
  config,
}: {
  data: TData | null;
  isOpen: boolean;
  onClose: () => void;
  config?: ActionConfig<TData>["viewDrawerConfig"];
}) {
  const isMobile = useIsMobile();

  if (!data) return null;

  const excludeFields = config?.excludeFields || [
    "id",
    "created_at",
    "updated_at",
    "image_url",
    "description",
  ];
  const fieldLabels = config?.fieldLabels || {};
  const imageField = config?.imageField;

  const entries = Object.entries(data as Record<string, undefined>).filter(
    ([key]) => !excludeFields.includes(key)
  );

  const title = config?.title ? config.title(data) : "View Details";
  const description = config?.description?.(data);
  const imageUrl = imageField ? (data as Record<string, undefined>)[imageField] : null;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={onClose}
      direction={isMobile ? "bottom" : "right"}
      >
      <DrawerContent className={isMobile ? "" : "min-w-lg"}>
        <DrawerHeader className='gap-1'>
          <DrawerTitle>{title}</DrawerTitle>
          {description && <DrawerDescription>{description}</DrawerDescription>}
        </DrawerHeader>

        <div className='flex flex-col overflow-y-scroll gap-4 px-4 pb-4'>
          {imageUrl && (
            <div className='relative aspect-video max-h-40 w-full'>
              <img
                src={imageUrl}
                alt='Item preview'
                className='h-full w-fit object-contain rounded-2xl mx-auto'
              />
            </div>
          )}
          {/* Custom Content */}
          {config?.customContent && (
            <>
              {config.customContent(data)}
              <Separator />
            </>
          )}
          {/* Data Grid */}
          <div className='grid grid-cols-2 gap-4'>
            {entries.map(([key, value]) => {
              const label = fieldLabels[key] || formatFieldName(key);
              const formattedValue = formatFieldValue(value);

              return (
                <div key={key} className='grid gap-1.5'>
                  <Label className='text-sm font-medium text-muted-foreground'>
                    {label}
                  </Label>
                  <div className='rounded-md border bg-muted/30 px-3 py-2 text-sm'>
                    {formattedValue}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button>Done</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export function DynamicDataTable<TData, TValue>({
  columns,
  data,
  enumFilters = [],
  dateRangeFilter,
  exportConfig,
  actions,
  FormComponent,
  showColumnVisibility = true,
  showPagination = true,
  showRowSelection = true,
  emptyMessage = "No results.",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [drawerData, setDrawerData] = useState<TData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dateRange: undefined,
    },
  });

  // Handle view with drawer
  const handleViewWithDrawer = (row: TData) => {
    setDrawerData(row);
    setIsDrawerOpen(true);
  };

  const tableColumns = useMemo(() => {
    if (!actions) {
      console.log("No actions provided");
      return columns;
    }

    const hasAnyAction =
      actions.onEdit ||
      actions.onDelete ||
      actions.onView ||
      (actions.customActions && actions.customActions.length > 0);

    console.log("Has any action:", hasAnyAction);

    if (!hasAnyAction) {
      console.log("No valid actions found");
      return columns;
    }

    const actionsColumn: ColumnDef<TData, TValue> = {
      id: "actions",
      header: () => (
        <div className='text-center'>
          Actions
        </div>
      ),
      enableHiding: false,
      cell: ({ row }) => {
        const rowData = row.original;
        return (
          <div className='flex items-center justify-center gap-1'>
            {actions.onView && (
              <Button
                variant='secondary'
                size='icon-sm'
                onClick={() => handleViewWithDrawer(rowData)}
              >
                <Eye className="text-primary"/>
                <span className='sr-only'>View</span>
              </Button>
            )}
            {actions.onEdit && (
              <Button
                variant='secondary'
                size='icon-sm'
                onClick={() => actions.onEdit?.(rowData)}
              >
                <Edit className="text-primary"/>
                <span className='sr-only'>Edit</span>
              </Button>
            )}
            {actions.onDelete && (
              <Button
                variant='secondary'
                size='icon-sm'
                className='text-destructive'
                onClick={() => actions.onDelete?.(rowData)}>
                <Trash2 />
                <span className='sr-only'>Delete</span>
              </Button>
            )}
            {actions.customActions && actions.customActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='h-8 w-8 p-0'>
                    <span className='sr-only'>Open menu</span>
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  {actions.customActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => action.onClick(rowData)}
                        className={
                          action.variant === "destructive"
                            ? "text-destructive focus:text-destructive"
                            : ""
                        }>
                        {Icon && <Icon className='mr-2 h-4 w-4' />}
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
    };

    const newColumns = [...columns, actionsColumn];
    console.log("Total columns including actions:", newColumns.length);
    return newColumns;
  }, [columns, actions]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const handleDateSelect = (range: { from?: Date; to?: Date }) => {
    if (!dateRangeFilter) return;
    form.setValue(
      "dateRange",
      range as z.infer<typeof FormSchema>["dateRange"]
    );
    table.getColumn(dateRangeFilter.columnId)?.setFilterValue(range);
  };

  const handleQuickRangeSelect = (months: number) => {
    if (!dateRangeFilter) return;
    const to = new Date();
    const from = subMonths(to, months);
    const range = { from, to };

    form.setValue(
      "dateRange",
      range as z.infer<typeof FormSchema>["dateRange"]
    );
    table.getColumn(dateRangeFilter.columnId)?.setFilterValue(range);
  };

  const defaultQuickRanges = [
    { value: 1, label: "Last 1 Month" },
    { value: 3, label: "Last 3 Months" },
    { value: 5, label: "Last 5 Months" },
    { value: 12, label: "Last 12 Months" },
  ];

  const quickRanges = dateRangeFilter?.quickRanges || defaultQuickRanges;

  return (
    <>
      <div>
        <div className='flex items-center py-4 space-x-2 flex-wrap gap-2'>
          {/* Enum Filters */}
          {enumFilters.map((filter) => (
            <Select
              key={filter.columnId}
              onValueChange={(value) =>
                table.getColumn(filter.columnId)?.setFilterValue(value)
              }
              value={
                (table
                  .getColumn(filter.columnId)
                  ?.getFilterValue() as string) ?? ""
              }>
              <SelectTrigger className='w-60'>
                <SelectValue placeholder={filter.placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{filter.label}</SelectLabel>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ))}

          {/* Date Range Filter */}
          {dateRangeFilter && (
            <div className='flex justify-center items-center'>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id='date'
                    variant='outline'
                    className={cn(
                      "w-56 justify-between text-left font-normal rounded-r-none",
                      !form.watch("dateRange") && "text-muted-foreground"
                    )}>
                    {form.watch("dateRange")?.from ? (
                      form.watch("dateRange")?.to ? (
                        <>
                          {form.watch("dateRange")?.from
                            ? format(
                                form.watch("dateRange")?.from || new Date(),
                                "LLL dd, y"
                              )
                            : "Invalid Date"}{" "}
                          -{" "}
                          {form.watch("dateRange")?.to
                            ? format(
                                form.watch("dateRange")?.to || new Date(),
                                "LLL dd, y"
                              )
                            : "Invalid Date"}
                        </>
                      ) : (
                        format(
                          form.watch("dateRange")?.from ?? new Date(),
                          "LLL dd, y"
                        )
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    initialFocus
                    mode='range'
                    numberOfMonths={2}
                    selected={
                      form.watch("dateRange")
                        ? {
                            from: form.watch("dateRange")?.from,
                            to: form.watch("dateRange")?.to,
                          }
                        : undefined
                    }
                    onSelect={handleDateSelect}
                    required
                  />
                </PopoverContent>
              </Popover>

              <Select
                onValueChange={(val) => handleQuickRangeSelect(Number(val))}>
                <SelectTrigger className='w-32 rounded-l-none text-xs'>
                  <SelectValue placeholder='Quick Range' />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Quick Ranges</SelectLabel>
                    {quickRanges.map((range) => (
                      <SelectItem key={range.value} value={String(range.value)}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Export Button */}
          {exportConfig && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='bg-primary hover:bg-chart-2 flex items-center gap-2'>
                  <FileDown className='w-4 h-4' />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-fit'>
                {(exportConfig.formats || ["xlsx", "csv"]).map((format) => (
                  <DropdownMenuItem
                    key={format}
                    onClick={() =>
                      exportTableData(table, format, exportConfig.filename)
                    }>
                    Export as {format.toUpperCase()} (.{format})
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Column Visibility */}
          {showColumnVisibility && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild className='w-40'>
                <Button variant='outline' className='ml-auto'>
                  Columns
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-48'>
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className='capitalize'
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }>
                        {column.id.replace(/_/g, " ")}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Custom Form Component */}
          {FormComponent && <FormComponent />}
        </div>

        {/* Table */}
        <div className='overflow-hidden rounded-md border'>
          <Table className='min-w-full'>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          header.column.id === "actions" &&
                            "sticky right-0 z-20 bg-background backdrop-blur-md" 
                        )}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          cell.column.id === "actions" &&
                            "sticky right-0 z-20 bg-background backdrop-blur-md"
                        )}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className='h-24 text-center'>
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {showPagination && (
          <div className='flex items-center justify-end space-x-2 py-4'>
            {showRowSelection && (
              <div className='text-muted-foreground flex-1 text-sm'>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
              </div>
            )}
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              Next
            </Button>
          </div>
        )}
      </div>

      {/* View Drawer */}
      <DataDrawer
        data={drawerData}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        config={actions?.viewDrawerConfig}
      />
    </>
  );
}
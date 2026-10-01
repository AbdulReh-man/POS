import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  endOfMonth,
  endOfWeek,
  format,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { businessNow } from "@/lib/businessDay";
import { CategorySalesContext } from "./category-sales-context";

type Period = "day" | "week" | "month" | "custom";

// The theme defines five chart colors; anything past the top five folds into "Other".
// Order swaps chart-3/chart-4 so neighbouring slices never get the two similar
// yellows of the light theme next to each other.
const SLICE_COLORS = [1, 2, 4, 3, 5].map((n) => `var(--chart-${n})`);
const MAX_SLICES = SLICE_COLORS.length;
const OTHER_COLOR = "var(--muted-foreground)";

const toISODate = (d: Date) => format(d, "yyyy-MM-dd");

function getRange(period: Period, custom?: DateRange) {
  const now = businessNow();
  switch (period) {
    case "day":
      return { from: now, to: now };
    case "week":
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case "month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "custom":
      if (!custom?.from) return null;
      return { from: custom.from, to: custom.to ?? custom.from };
  }
}

export function CategorySalesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <CategorySalesContext.Provider value={value}>
      {children}
      <CategorySalesDrawer open={open} onOpenChange={setOpen} />
    </CategorySalesContext.Provider>
  );
}

function CategorySalesDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isMobile = useIsMobile();
  const [period, setPeriod] = useState<Period>("day");
  const [customRange, setCustomRange] = useState<DateRange>();
  const [rows, setRows] = useState<CategorySale[]>([]);
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState("");

  const range = getRange(period, customRange);
  const fromKey = range ? toISODate(range.from) : null;
  const toKey = range ? toISODate(range.to) : null;

  useEffect(() => {
    if (!open) return;
    window.api.store.settingsGet().then((s) => setCurrency(s?.currency ?? ""));
  }, [open]);

  useEffect(() => {
    if (!open || !fromKey || !toKey) return;
    let cancelled = false;
    setLoading(true);
    window.api.dashboard
      .getCategorySalesByRange({ from: fromKey, to: toKey })
      .then((data) => {
        if (!cancelled) setRows(data ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, fromKey, toKey]);

  const formatMoney = (n: number) =>
    `${currency ? `${currency} ` : ""}${n.toLocaleString(undefined, {
      maximumFractionDigits: 2,
    })}`;

  const sumOf = (key: keyof Omit<CategorySale, "category_name">) =>
    rows.reduce((sum, r) => sum + r[key], 0);
  const totalSales = sumOf("total_sales");
  const totalDiscount = sumOf("total_discount");
  const totalProfit = sumOf("total_profit");
  const totalQty = sumOf("total_quantity");

  // Pie slices: top categories keep their own color, the rest fold into "Other".
  const { slices, chartConfig } = useMemo(() => {
    const top = rows.slice(0, MAX_SLICES);
    const rest = rows.slice(MAX_SLICES);
    const config: ChartConfig = {};
    const data = top.map((r, i) => {
      const key = `cat${i}`;
      config[key] = { label: r.category_name, color: SLICE_COLORS[i] };
      return { key, value: r.total_sales, fill: `var(--color-${key})` };
    });
    if (rest.length) {
      config.other = { label: `Other (${rest.length})`, color: OTHER_COLOR };
      data.push({
        key: "other",
        value: rest.reduce((sum, r) => sum + r.total_sales, 0),
        fill: "var(--color-other)",
      });
    }
    return { slices: data, chartConfig: config };
  }, [rows]);

  const colorFor = (index: number) =>
    index < MAX_SLICES ? SLICE_COLORS[index] : OTHER_COLOR;

  const rangeLabel = range
    ? fromKey === toKey
      ? format(range.from, "PPP")
      : `${format(range.from, "LLL dd, y")} – ${format(range.to, "LLL dd, y")}`
    : "Pick a date range";

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      direction={isMobile ? "bottom" : "right"}>
      <DrawerContent className='data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-xl'>
        <DrawerHeader className='gap-1'>
          <DrawerTitle>Sales by Category</DrawerTitle>
          <DrawerDescription>{rangeLabel}</DrawerDescription>
        </DrawerHeader>

        <div className='flex flex-col gap-4 overflow-y-auto px-4 pb-4'>
          {/* Period filters */}
          <div className='flex flex-wrap items-center gap-2'>
            <ToggleGroup
              type='single'
              variant='outline'
              size='sm'
              value={period}
              onValueChange={(v) => v && setPeriod(v as Period)}>
              <ToggleGroupItem value='day' className='px-3'>
                Today
              </ToggleGroupItem>
              <ToggleGroupItem value='week' className='px-3'>
                This Week
              </ToggleGroupItem>
              <ToggleGroupItem value='month' className='px-3'>
                This Month
              </ToggleGroupItem>
              <ToggleGroupItem value='custom' className='px-3'>
                Custom
              </ToggleGroupItem>
            </ToggleGroup>

            {period === "custom" && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className={cn(
                      "justify-start font-normal",
                      !customRange?.from && "text-muted-foreground",
                    )}>
                    <CalendarIcon className='h-4 w-4' />
                    {customRange?.from ? rangeLabel : "Pick a date range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='range'
                    numberOfMonths={isMobile ? 1 : 2}
                    selected={customRange}
                    onSelect={setCustomRange}
                    disabled={{ after: businessNow() }}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Totals: Sales is what customers paid, i.e. before-discount minus Discounts */}
          <div className='grid grid-cols-2 gap-3'>
            <StatTile
              label='Sales'
              value={formatMoney(totalSales)}
              hint={
                totalDiscount > 0
                  ? `${formatMoney(totalSales + totalDiscount)} before discount`
                  : undefined
              }
            />
            <StatTile
              label='Discounts'
              value={totalDiscount > 0 ? `− ${formatMoney(totalDiscount)}` : formatMoney(0)}
            />
            <StatTile
              label='Profit'
              value={formatMoney(totalProfit)}
              valueClassName={totalProfit < 0 ? "text-destructive" : undefined}
              hint='Sales minus cost of goods'
            />
            <StatTile label='Items Sold' value={totalQty.toLocaleString()} />
          </div>

          {loading ?
            <div className='flex h-[250px] items-center justify-center'>
              <Spinner />
            </div>
          : !range ?
            <p className='py-16 text-center text-sm text-muted-foreground'>
              Select a start and end date to see category sales.
            </p>
          : rows.length === 0 ?
            <p className='py-16 text-center text-sm text-muted-foreground'>
              No sales in this period.
            </p>
          : <>
              <ChartContainer
                config={chartConfig}
                className='mx-auto aspect-square h-[250px] shrink-0'>
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        nameKey='key'
                        formatter={(value, _name, item) => (
                          <div className='flex w-full items-center gap-2'>
                            <span
                              className='h-2.5 w-2.5 shrink-0 rounded-[2px]'
                              style={{ background: item.payload.fill }}
                            />
                            <span className='text-muted-foreground'>
                              {chartConfig[item.payload.key]?.label}
                            </span>
                            <span className='ml-auto font-mono font-medium tabular-nums text-foreground'>
                              {formatMoney(Number(value))} (
                              {((Number(value) / totalSales) * 100).toFixed(1)}
                              %)
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={slices}
                    dataKey='value'
                    nameKey='key'
                    innerRadius={65}
                    strokeWidth={2}
                    stroke='var(--background)'>
                    <Label
                      content={({ viewBox }) => {
                        if (!viewBox || !("cx" in viewBox)) return null;
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor='middle'
                            dominantBaseline='middle'>
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className='fill-foreground text-lg font-bold'>
                              {formatMoney(totalSales)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 22}
                              className='fill-muted-foreground text-xs'>
                              {rows.length}{" "}
                              {rows.length === 1 ? "category" : "categories"}
                            </tspan>
                          </text>
                        );
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              {/* Breakdown table: also acts as the legend */}
              <div className='shrink-0 overflow-hidden rounded-md border'>
                <table className='w-full text-sm'>
                  <thead className='bg-muted/50 text-xs text-muted-foreground'>
                    <tr>
                      <th className='px-3 py-2 text-left font-medium'>
                        Category
                      </th>
                      <th className='px-3 py-2 text-right font-medium'>Qty</th>
                      <th className='px-3 py-2 text-right font-medium'>
                        Orders
                      </th>
                      <th className='px-3 py-2 text-right font-medium'>
                        Sales
                      </th>
                      <th className='px-3 py-2 text-right font-medium'>
                        Profit
                      </th>
                      <th className='px-3 py-2 text-right font-medium'>
                        Share
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={r.category_name} className='border-t'>
                        <td className='px-3 py-2'>
                          <span className='flex items-center gap-2'>
                            <span
                              className='h-2.5 w-2.5 shrink-0 rounded-[2px]'
                              style={{ background: colorFor(i) }}
                            />
                            {r.category_name}
                          </span>
                        </td>
                        <td className='px-3 py-2 text-right tabular-nums'>
                          {r.total_quantity.toLocaleString()}
                        </td>
                        <td className='px-3 py-2 text-right tabular-nums'>
                          {r.total_orders.toLocaleString()}
                        </td>
                        <td className='px-3 py-2 text-right tabular-nums'>
                          {formatMoney(r.total_sales)}
                          {r.total_discount > 0 && (
                            <span className='block text-xs text-muted-foreground'>
                              − {formatMoney(r.total_discount)} disc.
                            </span>
                          )}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-2 text-right tabular-nums",
                            r.total_profit < 0 && "text-destructive",
                          )}>
                          {formatMoney(r.total_profit)}
                        </td>
                        <td className='px-3 py-2 text-right tabular-nums text-muted-foreground'>
                          {((r.total_sales / totalSales) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          }
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant='outline'>Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function StatTile({
  label,
  value,
  hint,
  valueClassName,
}: {
  label: string;
  value: string;
  hint?: string;
  valueClassName?: string;
}) {
  return (
    <div className='rounded-md border bg-muted/30 px-3 py-2'>
      <p className='text-xs text-muted-foreground'>{label}</p>
      <p className={cn("text-lg font-semibold tabular-nums", valueClassName)}>
        {value}
      </p>
      {hint && <p className='text-xs text-muted-foreground'>{hint}</p>}
    </div>
  );
}

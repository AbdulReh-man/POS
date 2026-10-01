import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { businessNow } from "@/lib/businessDay";

const chartConfig = {
  total_sales: {
    label: "Total Sales",
    color: "var(--chart-2)",
    icon: TrendingUp,
  },
  total_expenses: {
    label: "Total Expenses",
    color: "var(--chart-5)",
    icon: TrendingDown,
  },
  net_profit: {
    label: "Net Profit",
    color: "var(--chart-1)",
    icon: TrendingUp,
  },
} satisfies ChartConfig;

interface ChartAreaInteractiveProps {
  data: DashBoardSalesTrend[]; // ✅ You’ll just pass the data fetched from backend here
  title?: string;
  description?: string;
}

export function ChartAreaInteractive({
  data,
  title = "Sales Overview",
  description = "Showing performance for the selected period",
}: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState("30d");
  const [chartData, setChartData] = React.useState<DashBoardSalesTrend[]>([]);
  const isMobile = useIsMobile();

  // ✅ Set mobile default
  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  // ✅ Whenever new data is fetched, format and store it
  React.useEffect(() => {
    if (data && data.length > 0) {
      const formatted = data.map((d) => ({
        date: d.date,
        total_sales: d.total_sales,
        net_profit: d.net_profit,
        total_expenses: d.total_expenses,
      }));
      setChartData(formatted);
    }
  }, [data]);

  // ✅ Filter data based on selected range
  const filteredData = React.useMemo(() => {
    const ref = businessNow();
    const cutoff = new Date(ref);
    if (timeRange === "90d") cutoff.setDate(ref.getDate() - 90);
    else if (timeRange === "30d") cutoff.setDate(ref.getDate() - 30);
    else if (timeRange === "7d") cutoff.setDate(ref.getDate() - 7);
    return chartData.filter((i) => new Date(i.date) >= cutoff);
  }, [timeRange, chartData]);

  return (
    <Card className='pt-0'>
      <CardHeader className='flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row'>
        <div className='grid flex-1 gap-1'>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className='hidden w-[160px] rounded-lg sm:ml-auto sm:flex'
            aria-label='Select a value'>
            <SelectValue placeholder='Last 3 months' />
          </SelectTrigger>
          <SelectContent className='rounded-xl'>
            <SelectItem value='90d' className='rounded-lg'>
              Last 3 months
            </SelectItem>
            <SelectItem value='30d' className='rounded-lg'>
              Last 30 days
            </SelectItem>
            <SelectItem value='7d' className='rounded-lg'>
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'>
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id='fillSales' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--chart-2)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--chart-2)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillNetProfit' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--chart-1)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--chart-1)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillExpenses' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--chart-5)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--chart-5)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={true} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator='line'
                />
              }
            />

            {/* ✅ Multiple overlapping graph lines */}
            <Area
              dataKey='total_expenses'
              type='natural'
              fill='url(#fillExpenses)'
              stroke='var(--chart-5)'
              strokeWidth={2}
              stackId='a'
            />
            <Area
              dataKey='total_sales'
              type='natural'
              fill='url(#fillSales)'
              stroke='var(--chart-2)'
              strokeWidth={2}
              stackId='a'
            />
            <Area
              dataKey='net_profit'
              type='natural'
              fill='url(#fillNetProfit)'
              stroke='var(--chart-1)'
              strokeWidth={2}
              stackId='a'
            />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

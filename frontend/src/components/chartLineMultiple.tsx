import * as React from "react";
import { TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

type ChartLineMultipleProps = {
  title?: string;
  description?: string;
  data: any[];
  config: ChartConfig;
  xKey?: string; // default: "date"
  rangeLabel?: string;
};

export function ChartLineMultiple({
  title = "Line Chart - Multiple",
  description = "Showing performance trends",
  data,
  config,
  xKey = "date",
  rangeLabel = "Last 3 months",
}: ChartLineMultipleProps) {
  const [chartData, setChartData] = React.useState(data);

  React.useEffect(() => {
    setChartData(data);
  }, [data]);

  return (
    <Card className='border shadow-sm hover:shadow-md transition-all duration-300'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold tracking-tight'>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={config}
          className='aspect-auto h-[300px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray='3 3' vertical={false} />
              <XAxis
                dataKey={xKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return isNaN(date.getTime())
                    ? value
                    : date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                width={40}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={<ChartTooltipContent />}
              />
              {Object.entries(config).map(([key, { color }]) => {
                if (!color) return null;
                return (
                  <Line
                    key={key}
                    type='monotone'
                    dataKey={key}
                    stroke={`var(--${color
                      .replace("var(--", "")
                      .replace(")", "")})`}
                    strokeWidth={2}
                    dot={false}
                  />
                );
              })}
              <ChartLegend content={<ChartLegendContent />} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter>
        <div className='flex w-full items-start gap-2 text-sm'>
          <div className='grid gap-2'>
            <div className='flex items-center gap-2 leading-none font-medium text-emerald-600'>
              Trending up by 5.2% this period
              <TrendingUp className='h-4 w-4' />
            </div>
            <div className='text-muted-foreground leading-none'>
              {rangeLabel}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { ChartLineMultiple } from "@/components/chartLineMultiple";
import { DynamicDataTable } from "@/components/data-table";
// import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { CategorySalesButton } from "@/components/category-sales";
import { TodaySaleColumns } from "@/components/tableCoumns";
import type { ChartConfig } from "@/components/ui/chart";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const HomePage = () => {
  const [salesData, setSalesData] = useState<TodaySale[]>([]);
    const [chartData, setChartData] = useState<DashBoardSalesTrend[]>([]);

    useEffect(() => {
      const fetchData = async () => {
        const data: DashBoardSalesTrend[] =
          await window.api.dashboard.getSalesTrends();
        // format for chart
        const formatted = data.map((d) => ({
          date: d.date,
          total_sales: d.total_sales,
          net_profit: d.net_profit,
          total_expenses: d.total_expenses,
        }));
        setChartData(formatted);
      };
      fetchData();
    }, []);

  useEffect(() => {
    window.api.dashboard.getRecentSales().then((data) => {
      setSalesData(data);
    });
  }, []);

  const chartConfig = {
    total_sales: {
      label: "Total Sales",
      color: "var(--chart-2)",
    },
    total_expenses: {
      label: "Expenses",
      color: "var(--chart-5)",
    },
    net_profit: {
      label: "Net Profit",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig;

  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2'>
        <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6'>
          <SectionCards />
          <Tabs defaultValue='lineChart' className='w-full'>
            <div className='flex items-center justify-between gap-2'>
              <TabsList className='min-w-xs'>
                <TabsTrigger value='lineChart'>Line Chart</TabsTrigger>
                <TabsTrigger value='areaChart'>Area Chart</TabsTrigger>
              </TabsList>
              <CategorySalesButton />
            </div>
            <TabsContent value='areaChart'>
              <ChartAreaInteractive
                data={chartData}
                title='Performance Overview'
              />
            </TabsContent>
            <TabsContent value='lineChart'>
              <ChartLineMultiple
                title='Performance Overview'
                description='Sales, Expenses & Profit (last 90 days)'
                data={chartData}
                config={chartConfig}
                xKey='date'
                rangeLabel='Last 90 Days'
              />
            </TabsContent>
          </Tabs>
          <Card className='bg-gradient-to-b from-card/80 to-background shadow-md'>
            <CardHeader>
              <CardTitle className='text-2xl text-primary'>
                Today's Sales
              </CardTitle>
              <CardDescription>
                View the sales data for today. Track transactions, customer
                details, and payment methods in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DynamicDataTable<TodaySale, undefined>
                data={salesData}
                columns={TodaySaleColumns}
                enumFilters={[
                  {
                    columnId: "payment_method",
                    placeholder: "Select Payment Method",
                    label: "Payment Method",
                    options: [
                      { value: "cash", label: "Cash" },
                      { value: "card", label: "Card" },
                      { value: "wallet", label: "Wallet" },
                      { value: "other", label: "Other" },
                    ],
                  },
                ]}
                dateRangeFilter={{
                  columnId: "created_at",
                  quickRanges: [
                    { value: 1, label: "Last 1 Month" },
                    { value: 3, label: "Last 3 Months" },
                    { value: 5, label: "Last 5 Months" },
                    { value: 12, label: "Last 12 Months" },
                  ],
                }}
                exportConfig={{
                  filename: "expense_data",
                  formats: ["xlsx", "csv"],
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

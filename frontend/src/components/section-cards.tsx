import { useEffect, useState } from "react";
import {
  IconTrendingDown,
  IconTrendingUp,
  IconPackage,
  IconUsers,
  IconShoppingCart,
  IconCash,
} from "@tabler/icons-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  const [stats, setStats] = useState<DashBoardStats | null>(null);
  const [settings, setSettings] = useState<Settings>();

  useEffect(() => {
    const get = async () => {
      const data = await window.api.dashboard.getDashboardStats();
      console.log("Dashboard Stats: ", data);
      setStats(data);
    };
    get();
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      const savedSettings = await window.api.store.settingsGet();
      setSettings(savedSettings);
    };
    fetchSettings();
  }, []);

  const cards = [
    {
      title: "Total Sales (This Month)",
      value: stats
        ? `${settings?.currency} ${stats.sales_this_month.toLocaleString()}`
        : "...",
      icon: <IconCash className='text-green-500' />,
      trend: "+12%",
      desc: "Compared to last month",
      trendUp: true,
    },
    {
      title: "Total Expenses (This Month)",
      value: stats
        ? `${settings?.currency} ${stats.expenses_this_month.toLocaleString()}`
        : "...",
      icon: <IconPackage className='text-blue-500' />,
      trend: "+3%",
      desc: "Inventory updated regularly",
      trendUp: true,
    },
    // {
    //   title: "Total Customers",
    //   value: stats ? stats.total_customers.toLocaleString() : "...",
    //   icon: <IconUsers className='text-purple-500' />,
    //   trend: "+8%",
    //   desc: "New customers this month",
    //   trendUp: true,
    // },
    {
      title: "Today's Sales",
      value: stats ? stats.sales_today.toLocaleString() : "...",
      icon: <IconUsers className='text-purple-500' />,
      trend: "+8%",
      desc: "Sales made today",
      trendUp: true,
    },
    {
      title: "Total Profit (This Month)",
      value: stats
        ? `${settings?.currency} ${stats.net_profit.toLocaleString()}`
        : "...",
      icon: <IconShoppingCart className='text-yellow-500' />,
      trend: "-5%",
      desc: "Slightly lower than last month",
      trendUp: false,
    },
  ];

  console.log();
  

  return (
    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
      {cards.map((card, i) => (
        <div key={i}>
          <Card className='bg-gradient-to-b from-card/80 to-background shadow-md border border-border/50 hover:shadow-lg transition-all duration-300'>
            <CardHeader className='flex flex-row items-center justify-between'>
              <div>
                <CardDescription>{card.title}</CardDescription>
                <CardTitle className='text-3xl font-bold mt-1'>
                  {card.value}
                </CardTitle>
              </div>
              <div className='text-3xl'>{card.icon}</div>
            </CardHeader>

            <CardFooter className='flex items-center justify-between mt-2 text-sm'>
              <div className='flex items-center gap-1 font-medium'>
                {card.trendUp ? (
                  <IconTrendingUp className='size-4 text-green-500' />
                ) : (
                  <IconTrendingDown className='size-4 text-red-500' />
                )}
                {card.trend}
              </div>
              <span className='text-muted-foreground'>{card.desc}</span>
            </CardFooter>
          </Card>
        </div>
      ))}
    </div>
  );
}

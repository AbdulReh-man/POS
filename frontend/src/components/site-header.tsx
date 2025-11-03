import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Printer,
  ScanBarcode,
  ShoppingBasket,
  Sun,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function SiteHeader() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    window.api.store.settingsUpdate({ theme: newTheme });
  };

  useEffect(() => {
    (async () => {
      await window.api.store.settingsGet().then((settings) => {
        if (settings && settings.theme) {
          setTheme(settings.theme);
          setSettings(settings)
        }
      });
    })();
  }, []);

  return (
    <header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <Separator
          orientation='vertical'
          typeof='thick'
          className='mx-2 data-[orientation=vertical]:h-4'
        />
        <div>
          <h1 className='text-lg font-bold text-gray-900 dark:text-gray-100 uppercase'>
            {settings?.storeName}
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1 text-base'>
            Admin Dashboard
          </p>
        </div>

        <div className='ml-auto flex items-center gap-4'>
          <Button onClick={toggleTheme} variant='ghost' size='sm'>
            {theme === "light" ? (
              <>
                <Sun className='h-4 w-4' /> Light
              </>
            ) : (
              <>
                <Moon className='h-4 w-4' /> Dark
              </>
            )}
          </Button>
          <Button variant='ghost' size='sm'>
            <Printer className='h-5 w-5' /> Print
          </Button>
          <Button variant='ghost' size='sm'>
            <ScanBarcode className='h-5 w-5' /> Scan
          </Button>
          <Button variant='ghost' size='sm' onClick={() => navigate("/pos")}>
            <ShoppingBasket className='h-5 w-5' /> Sell
          </Button>
        </div>
      </div>
    </header>
  );
}

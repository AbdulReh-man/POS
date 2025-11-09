import { Link, Outlet, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { getItemsByStoreType as Items } from "@/constants";
import { SiteHeader } from "@/components/site-header";
import UserProfile from "@/components/userProfile";
import { useEffect, useState } from "react";
function App() {
  return (
    <>
      <SidebarProvider
        defaultOpen={false}
        style={
          {
            "--sidebar-width": "15rem",
            "--sidebar-width-mobile": "20rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <main>
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}

export default App;

export const AppSidebar = () => {
  const location = useLocation();
  const [settings, setSettings] = useState<Settings>();
  useEffect(() => {
      const getSettings = async() => {
        const get = await window.api.store.settingsGet();
        setSettings(get);
      }
      getSettings();
    }, [])
  return (
    <Sidebar collapsible='icon' variant='floating'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to='/'>
              <SidebarMenuButton
                size='lg'
                className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer'>
                <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square items-center justify-center rounded-lg h-10 w-10'>
                  <img
                    src={settings?.logoPath}
                    alt={settings?.storeName?.slice(0,4)}
                    className=' rounded object-contain bg-primary w-full h-full'
                  />
                </div>
                <span className='uppercase font-bold'>{settings?.storeName}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel> Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {Items(settings?.storetype || "").map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserProfile />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

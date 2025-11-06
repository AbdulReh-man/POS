import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";
import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const UserProfile = () => {
  const { isMobile } = useSidebar();
  const [settings, setSettings] = useState<Settings>();
  const [userSettings, setUserSettings] = useState<LoginData>();
  useEffect(() => {
    const getSettings = async() => {
      const get = await window.api.store.settingsGet();
      setSettings(get);
    }
    getSettings();
  }, [])

  useEffect(() => {
    const getUserSettings = async() => {
      const get = await window.api.store.getLogin();
      setUserSettings(get || undefined);
    }
    getUserSettings();
  },[])
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size='lg'
          className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'>
          <Avatar className='h-8 w-8 rounded-full cursor-pointer border-2 border-gray-200 hover:border-primary transition bg-primary'>
            <AvatarImage src={settings?.logoPath} alt={"User"} />
            <AvatarFallback className='rounded-lg'>{userSettings?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-medium'>{userSettings?.username}</span>
            <span className='truncate text-xs'>{userSettings?.email}</span>
          </div>
          <ChevronsUpDown className='ml-auto size-4' />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
        side={isMobile ? "bottom" : "right"}
        align='end'
        sideOffset={4}>
        <DropdownMenuLabel className='p-0 font-normal'>
          <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
            <Avatar className='h-8 w-8 rounded-full border-2 border-gray-200 transition bg-primary'>
              <AvatarImage src={settings?.logoPath} alt={"User"} />
              <AvatarFallback className='rounded-lg'>CN</AvatarFallback>
            </Avatar>
            <div className='grid flex-1 text-left text-sm leading-tight'>
              <span className='truncate font-medium'>
                {userSettings?.username}
              </span>
              <span className='truncate text-xs'>{userSettings?.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            Profile
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link to='/settings'>
            <DropdownMenuItem>
              <BadgeCheck />
              Settings
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            window.api.store.clearLogin();
            toast.message("Logged out successfully");
            window.location.reload();
          }}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;

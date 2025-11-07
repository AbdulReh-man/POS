
import ReceiptStaticForm from "@/components/forms/recieptForm";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import UserForm from "@/components/forms/userForm";
import PrinterSettingsForm from "@/components/forms/printerSettingsForm";
import { useEffect, useState } from "react";

export default function SettingPage() {
  const [userRole, setUserRole] = useState<string>();

  useEffect(() => {
    const getUser = async () => {
      const loginData = await window.api.store.getLogin();
      if (loginData) {
      setUserRole(loginData.role || "admin");
      }
      return null;
    };
    getUser()
  }, []);
  
  return (
    <div className='max-w-3xl mx-auto p-6 space-y-4'>
      <h1 className='text-2xl font-bold mb-4'>Settings</h1>

      <Accordion
        type='single'
        collapsible
        className='w-full space-y-2'
        defaultValue='printer'>
        {userRole === "admin" && (
          <AccordionItem value='profile'>
            <AccordionTrigger className='text-lg font-medium'>
              Profile Settings
            </AccordionTrigger>
            <AccordionContent>
              <UserForm />
            </AccordionContent>
          </AccordionItem>
        )}
        {/* Receipt Settings */}
        <AccordionItem value='receipt'>
          <AccordionTrigger className='text-lg font-medium'>
            Receipt Settings
          </AccordionTrigger>
          <AccordionContent>
            <ReceiptStaticForm role={userRole} />
          </AccordionContent>
        </AccordionItem>
        {/* Printer Settings */}
        <AccordionItem value='printer'>
          <AccordionTrigger className='text-lg font-medium'>
            Printer Settings
          </AccordionTrigger>
          <AccordionContent>
            <PrinterSettingsForm />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
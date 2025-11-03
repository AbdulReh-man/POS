import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Printer,
  Save,
  Search,
  Wifi,
  AlertCircle,
  PrinterCheckIcon,
} from "lucide-react";
import { toast } from "sonner";
import { printerSchema, type PrinterFormValues } from "@/Schema/recieptSchema";
import { IconFolderCode, IconPrinterOff } from "@tabler/icons-react";

export default function PrinterSettingsForm() {
  const [printer, setPrinter] = useState<PrinterConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [status, setStatus] = useState<"connected" | "disconnected" | "none">(
    "none"
  );

  const form = useForm<PrinterFormValues>({
    resolver: zodResolver(printerSchema),
    defaultValues: {
      vendorId: "",
      productId: "",
    },
  });

  // 🔍 Auto-detect printer
  const handleDetectPrinter = async () => {
    setDetecting(true);
    try {
      const detected = await window.api.sales.printReceipt({ testMode: true });
      console.log(detected);
      if (detected?.success === true) {
        setStatus("connected");
        toast.success("Printer auto-detected successfully!");
      } else {
        toast.error("No printer detected.");
        setStatus("disconnected");
      }
    } catch {
      toast.error("Failed to detect printer");
      setStatus("disconnected");
    } finally {
      setDetecting(false);
    }
  };

  // 💾 Save printer configuration
  const handleSave = async (data: PrinterFormValues) => {
    try {
      setLoading(true);
      const printerData = {
        vendorId: parseInt(data.vendorId.replace("0x", ""), 16),
        productId: parseInt(data.productId.replace("0x", ""), 16),
      };
      await window.api.sales.savePrinter(printerData);
      setPrinter(printerData);
      toast.success("Printer configuration saved successfully!");
      handleDetectPrinter();
    } catch {
      toast.error("Failed to save printer configuration");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedPrinter = async () => {
      const saved = await window.api.sales.getSavedPrinter();
      if (saved) {
        const vId = `0x${saved.vendorId.toString(16).toUpperCase()}`;
        const pId = `0x${saved.productId.toString(16).toUpperCase()}`;
        form.setValue("vendorId", vId);
        form.setValue("productId", pId);
        setPrinter(saved);
        // Check connection status dynamically
        await handleDetectPrinter();
      }
    }
  
  // 🧠 Load saved printer on mount
  useEffect(() => {
    loadSavedPrinter();
  }, []);

  // 🖨 Test print
  const handleTestPrint = async () => {
    toast.info("Sending test print...");
    const result = await window.api.sales.printReceipt({
      text: "Test Print from Electron 🚀",
    });
    if (result?.success) toast.success("Test print sent successfully!");
    else toast.error("Print failed or no printer connected.");
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-4 max-w-5xl mx-auto'>
      {/* 🖨 Printer Configuration Form */}
      <Card className='shadow-md border rounded-2xl bg-background/60 backdrop-blur p-2'>
        <CardHeader className='pt-5 border-b'>
          <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
            <Printer className='w-5 h-5' /> Printer Settings
          </CardTitle>
        </CardHeader>

        <CardContent className='pb-5 space-y-5'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSave)}
              className='space-y-5'>
              <FormField
                control={form.control}
                name='vendorId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor ID</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. 0x04B8' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='productId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product ID</FormLabel>
                    <FormControl>
                      <Input placeholder='e.g. 0x0202' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex flex-wrap gap-3 justify-between pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  className='flex-1 flex items-center gap-2'
                  onClick={handleDetectPrinter}
                  disabled={detecting}>
                  {detecting ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' /> Detecting...
                    </>
                  ) : (
                    <>
                      <Search className='w-4 h-4' /> Auto Detect
                    </>
                  )}
                </Button>

                <Button
                  type='submit'
                  className='flex-1 flex items-center gap-2'
                  disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className='w-4 h-4' /> Save
                    </>
                  )}
                </Button>

                <Button
                  type='button'
                  variant='secondary'
                  className='flex-1 flex items-center gap-2'
                  onClick={handleTestPrint}
                  disabled={status !== "connected"}
                >
                  <Printer className='w-4 h-4' /> Test Print
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* 🧠 Printer Info Dashboard */}
      <Card className='shadow-md border rounded-2xl bg-background/60 backdrop-blur p-2'>
        <CardHeader className='pt-5 border-b'>
          <CardTitle className='flex items-center gap-2 text-lg font-semibold'>
            <Wifi className='w-5 h-5 text-chart-2' /> Printer Status
          </CardTitle>
        </CardHeader>

        <CardContent className='pb-5 space-y-5'>
          {status === "none" && printer === null ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <IconFolderCode />
                </EmptyMedia>
                <EmptyTitle>No Printer Found!</EmptyTitle>
                <EmptyDescription>
                  Try Detaching or reconnecting again
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  type='button'
                  variant='secondary'
                  className='flex-1 flex items-center gap-2'
                  onClick={handleDetectPrinter}
                  disabled={detecting}>
                  {detecting ? (
                    <>
                      <Loader2 className='w-4 h-4 animate-spin' /> Detecting...
                    </>
                  ) : (
                    <>
                      <Search className='w-4 h-4' /> Connect Again
                    </>
                  )}
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-3 h-3 rounded-full ${
                    status === "connected"
                      ? "bg-chart-2"
                      : "bg-destructive animate-pulse"
                  }`}
                />
                <span className='font-medium capitalize'>{status}</span>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <Label className='text-sm text-muted-foreground'>
                    Vendor ID
                  </Label>
                  <p className='font-medium'>
                    {form.getValues("vendorId") || "N/A"}
                  </p>
                </div>
                <div>
                  <Label className='text-sm text-muted-foreground'>
                    Product ID
                  </Label>
                  <p className='font-medium'>
                    {form.getValues("productId") || "N/A"}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-2 mt-3 text-sm text-muted-foreground'>
                <AlertCircle className='w-4 h-4 mt-0.5' />
                <p>
                  {status === "connected"
                    ? "Your printer is ready for printing."
                    : "Printer not connected. Try re-detecting or reconnecting."}
                </p>
              </div>
            </div>
          )}
          <div
            className={`flex justify-center items-center w-full max-w-md h-28 ${
              status === "connected" ? "bg-chart-2/5" : "bg-destructive/5"
            } border p-1 rounded-lg`}>
            {status === "connected" ? (
              <PrinterCheckIcon className='h-full w-full stroke-muted-foreground stroke-1' />
            ) : (
              <IconPrinterOff className='h-full w-full stroke-destructive stroke-1' />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

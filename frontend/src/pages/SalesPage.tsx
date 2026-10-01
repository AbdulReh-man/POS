import { SalesColumns } from "@/components/tableCoumns";
import { useEffect, useState } from "react";
import { DynamicDataTable } from "@/components/data-table";
import { toast } from "sonner";
import { detectPrinter } from "@/helpers/printerHelper";
import { Label } from "@/components/ui/label";
import { CategorySalesButton } from "@/components/category-sales";
const SalesPage = () => {
  const [data, setData] = useState<Sale[]>([]);

  useEffect(() => {
    const getsales = async () => {
      // Fetch sales data from API
      const sales = await window.api.sales.getAll();
      setData(sales);
    };
    getsales();
  }, []);
  
  return (
    <div className='max-h-screen p-6'>
      <div className='mx-auto flex items-center justify-between gap-4'>
        <h1 className='text-3xl font-bold text-primary'>Sales Information</h1>
        <CategorySalesButton />
      </div>
      <div className='container mx-auto py-10'>
        <DynamicDataTable
          columns={SalesColumns}
          data={data}
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
          actions={{
            onView: true,
            onPrint: async (row) => {
              const res = await window.api.sales.getSaleWithItems(row.id);
              console.log("Fetched sale for printing:", res);
              if (!res) {
                toast.error("Sale data not found for printing.");
                return;
              }
              console.log("Preparing to print sale:", res);
              // 🧾 Prepare print data
              const printData = {
                date: new Date().toLocaleString(),
                subtotal: res?.items?.reduce(
                  (sum, item) => sum + (item.subtotal ?? 0),
                  0
                ),
                discount: res.discount,
                tax: 0,
                total: res.total,
                orderId: res.invoice_number,
                paymentType: res.payment_method,
                items:
                  res.items?.map((item: SaleItem) => ({
                    name: item.name,
                    qty: item.qty,
                    price: item.price,
                  })) || [],
              };

              toast.promise(
                new Promise((resolve, reject) => {
                  setTimeout(async () => {
                    try {
                      // 🖨️ Detect printer
                      const connected = await detectPrinter({ testMode: true });
                      // 🖨️ Optional printing
                      if (connected) {
                        await window.api.sales.printReceipt(printData);
                        resolve(true);
                      } else {
                        reject(
                          new Error(
                            "Receipt not generated. No printer detected."
                          )
                        );
                      }
                    } catch (err) {
                      console.error("Print failed:", err);
                      reject(
                        new Error(
                          "Print failed. Please check printer connection."
                        )
                      );
                    }
                  }, 1000);
                }),
                {
                  loading: "Generating receipt...",
                  success: "Receipt generated successfully!",
                  error: (error) => error.message,
                }
              );
            },
            viewDrawerConfig: {
              customContent: (row: Sale) => {
                return <SaleDetails saleId={row.id} />;
              },
            },
          }}
          showColumnVisibility={true}
          showPagination={true}
          showRowSelection={true}
        />
      </div>
    </div>
  );
};

export default SalesPage;


function SaleDetails({saleId}: {saleId : string | number}) {
  const [sale, setSale] = useState<Sale>();

  useEffect(() => {
    window.api.sales.getById(saleId).then((data) => {
      setSale(data);
      console.log("Fetched sale details:", data);
    });
  }, [saleId]);

  if (!sale) return <p>Loading sale...</p>;

  return (
    <>
      <h1 className='font-bold mb-2'>Items Details</h1>
      <div className='grid grid-cols-1 gap-4'>
        {sale.items?.map((item, index) => (
          <div key={index} className='grid grid-cols-4 gap-4 border rounded-md p-3'>
        <div className='grid gap-1.5'>
          <Label className='text-sm font-medium text-muted-foreground'>
            Product Name
          </Label>
          <div className='rounded-md border bg-muted/30 px-3 py-2 text-sm'>
            {item.name?.toUpperCase()}
          </div>
        </div>
        <div className='grid gap-1.5'>
          <Label className='text-sm font-medium text-muted-foreground'>
            Quantity
          </Label>
          <div className='rounded-md border bg-muted/30 px-3 py-2 text-sm'>
            {item.qty}
          </div>
        </div>
        <div className='grid gap-1.5'>
          <Label className='text-sm font-medium text-muted-foreground'>
            Price
          </Label>
          <div className='rounded-md border bg-muted/30 px-3 py-2 text-sm'>
            {item.price}
          </div>
        </div>
        <div className='grid gap-1.5'>
          <Label className='text-sm font-medium text-muted-foreground'>
            Subtotal
          </Label>
          <div className='rounded-md border bg-muted/30 px-3 py-2 text-sm'>
            {item.subtotal}
          </div>
        </div>
          </div>
        ))}
      </div>
    </>
  );
}

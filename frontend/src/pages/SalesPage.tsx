import { SalesColumns } from "@/components/tableCoumns";
import { useEffect, useState } from "react";
import { DynamicDataTable } from "@/components/data-table";
import { toast } from "sonner";
import { detectPrinter } from "@/helpers/printerHelper";

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
      <div className='max-w-7xl mx-auto space-y-6'>
        <h1 className='text-3xl font-bold text-primary'>Sales Information</h1>
      </div>
      <div className='container mx-auto py-10'>
        <DynamicDataTable columns={SalesColumns} data={data}
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
                      qty: item.quantity,
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

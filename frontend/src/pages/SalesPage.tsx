import { SalesColumns } from "@/components/tableCoumns";
import { useEffect, useState } from "react";
import { DynamicDataTable } from "@/components/data-table";

const SalesPage = () => {
  const [data, setData] = useState<Sale[]>([]);

  
  useEffect(() => {
    const getsales = async () => {
      // Fetch sales data from API
      const sales = await window.api.sales.getAll();
      setData(sales);
      console.log(sales);
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
            onView: true
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

import { Label } from "@/components/ui/label";

const EditSales = ({ sale }: { sale: Sale }) => {
  return (
    <div>
      <h1>Edit Sale</h1>
      {sale.items?.map((item, index) => (
        <div
          key={index}
          className='grid grid-cols-4 gap-4 border rounded-md p-3'>
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
  );
}

export default EditSales;

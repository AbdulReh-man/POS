import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import fallbackLogo from "@/assets/awami.svg";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { detectPrinter } from "@/helpers/printerHelper";

export interface LastSaleData {
  id: string | number;
  invoice_number: string;
  total: number;
  discount: number;
  subtotal?: number; // optional, since you compute it locally too
  tax?: number;
  payment_method: string;
  created_at?: string; // ISO timestamp, optional if your API includes it
  items: SaleItem[];
}

export default function POSFrontPage() {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receiptGenerated, setReceiptGenerated] = useState(false);
  const [storeSettings, setStoreSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [lastSaleData, setLastSaleData] = useState<LastSaleData>();
  const [filter, setFilter] = useState("");
  const addToCart = (product: Product) => {
    if (receiptGenerated) {
      setReceiptGenerated(false);
      setLastSaleData(undefined);
    }
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          id: product.id,
          name: product.name,
          price: Number(product.price),
          qty: 1,
        },
      ];
    });
  };

  const removeFromCart = (id: string | number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const discountPercent = (discount / 100) * subtotal;
  const total = subtotal - discountPercent;
  const storeCurrency = storeSettings?.currency || "";
  const logo = storeSettings?.logoPath || fallbackLogo;

  const handleSubmit = async () => {
  const saleData = {
    total,
    discount,
    payment_method: paymentMethod,
    items: cart,
  };

  try {
    const res = await window.api.sales.createFull(saleData);

    toast.success("Sale successfully created!");
    setLastSaleData({
      id: res.id as string | number,
      invoice_number: res.invoice_number as string,
      total: res.total as number,
      discount: discount,
      subtotal: subtotal,
      tax: 0,
      payment_method: paymentMethod as string,
      created_at: res.created_at as string,
      items: res.items as SaleItem[],
    }); // 🧾 Store last sale data

    // 🧾 Prepare print data
    const printData = {
      date: new Date().toLocaleString(),
      subtotal,
      discount: res.discount as number,
      tax: 0,
      total: res.total as number,
      orderId: res.invoice_number as string,
      paymentType: res.payment_method as string,
      items:
        res.items?.map((item) => ({
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
              setReceiptGenerated(true);
              setCart([]); // clear cart only if printed
              resolve(true);
            } else {
              reject(
                new Error(
                  "Order created but receipt not generated. No printer detected."
                )
              );
            }
          } catch (err) {
            console.error("Print failed:", err);
            reject(new Error("Print failed. Please check printer connection."));
          }
        }, 2000);
      }),
      {
        loading: "Generating receipt...",
        success: "Receipt generated successfully!",
        error: (error) => error.message,
      }
    );
  } catch (err) {
    console.error("Sale creation failed:", err);
    toast.error("Sale creation failed. Please try again.");
  }
  };

const handleGenerateReceipt = async () => {
  if (!lastSaleData) {
    toast.error("No sale data available to generate receipt.");
    return;
  }

  const printData = {
    date: new Date().toLocaleString(),
    subtotal: lastSaleData.subtotal,
    discount: lastSaleData.discount,
    tax: 0,
    total: lastSaleData.total,
    orderId: lastSaleData.invoice_number,
    paymentType: lastSaleData.payment_method,
    items:
      lastSaleData.items?.map((item) => ({
        name: item.name,
        qty: item.qty,
        price: item.price,
      })) || [],
  };

  try {
    await window.api.sales.printReceipt(printData);
    toast.success("Receipt generated!");
    setCart([]); // clear now after manual print
    setReceiptGenerated(true);
  } catch (err) {
    console.error("Manual print failed:", err);
    toast.error("Failed to generate receipt");
  }
};


  const filteredProducts = (products || []).filter((p) =>
    p.name.toLowerCase().includes(filter.toLowerCase())
  );

  // Add this helper function to calculate live stock
  const getLiveStock = (product: Product) => {
    const cartItem = cart.find((item) => item.id === product.id);
    const cartQuantity = cartItem?.qty || 0;
    return product.stock - cartQuantity;
  };

  useEffect(() => {
    window.api.products
      .getAll()
      .then((data: { data: Product[] }) => {
        setProducts(data?.data);
      })
      .catch((err) => toast.error("Products Fetch Error", err));

    window.api.store.settingsGet().then((settings) => {
      setStoreSettings(settings);
      setDiscount(settings?.discount || 0);
    });
  }, []);

  return (
    <div className='grid grid-cols-3 gap-4 p-6 h-screen'>
      {/* Left - Products with Topbar */}
      <div className='col-span-2 flex flex-col h-full'>
        {/* Top Filter Bar */}
        <div className='mb-4 flex gap-2 items-center'>
          <Input
            placeholder='Search products...'
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className='w-1/3'
          />
        </div>

        {/* Product Cards Scrollable */}
        <div className='grid grid-cols-3 gap-4 overflow-y-auto pr-2'>
          {filteredProducts &&
            filteredProducts?.map((product) => (
              <Card
                key={product.id}
                className={`cursor-pointer hover:shadow-lg ${
                  getLiveStock(product) <= 0
                    ? "opacity-50 pointer-events-none"
                    : ""
                }`}
                onClick={() => addToCart(product)}>
                <CardContent className='flex flex-col items-center relative'>
                  {getLiveStock(product) <= 0 && (
                    <div className='absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl z-10'>
                      <span className='bg-red-500 text-white px-3 py-1 rounded font-semibold'>
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name || "Product"}
                      className='object-contain rounded-xl mb-2 aspect-video'
                    />
                  ) : (
                    <div className='relative flex items-center justify-center rounded-xl mb-2 aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800'>
                      <img
                        src={logo}
                        alt='logo'
                        className='absolute inset-0 w-full h-full object-contain repeat-infinite opacity-40 dark:invert dark:sepia dark:saturate-500 dark:hue-rotate-10 brightness-100'
                      />
                    </div>
                  )}
                  <h2 className='font-semibold text-lg'>{product.name}</h2>
                  <p className='text-gray-500'>
                    {storeCurrency} {Number(product.price).toFixed(1)}
                  </p>
                  <Button
                    className='mt-2 w-full'
                    disabled={getLiveStock(product) <= 0}>
                    Add
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      {/* Right - Sticky Checkout */}
      <div className='col-span-1 border p-4 rounded-2xl shadow-md flex flex-col gap-4 sticky top-6 h-fit self-start'>
        <h2 className='text-xl font-bold'>Checkout</h2>

        {/* Cart Items */}
        <div className='flex-1 overflow-y-auto max-h-64'>
          {cart.length === 0 ? (
            <p className='text-gray-400'>No items selected</p>
          ) : (
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='border-b-2'>
                  <th className='py-2'>Item</th>
                  <th className='py-2'>Qty</th>
                  <th className='py-2'>Price</th>
                  <th className='py-2'>Total</th>
                  <th className='py-2'>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} className='border-b-2'>
                    <td className='py-2'>{item.name}</td>
                    <td className='py-2'>
                      {(() => {
                        const product = products.find((p) => p.id === item.id);
                        const maxQty = product ? product.stock : 1;
                        return (
                          <Input
                            type='number'
                            min={1}
                            max={maxQty}
                            value={item.qty}
                            className='max-w-16'
                            onChange={(e) => {
                              const newQty = Math.max(
                                1,
                                Math.min(maxQty, Number(e.target.value))
                              );
                              setCart((prev) =>
                                prev.map((cartItem) =>
                                  cartItem.id === item.id
                                    ? { ...cartItem, qty: newQty }
                                    : cartItem
                                )
                              );
                            }}
                          />
                        );
                      })()}
                    </td>
                    <td className='py-2'>{item.price.toFixed(2)}</td>
                    <td className='py-2'>
                      {(item.price * item.qty).toFixed(2)}
                    </td>
                    <td className='py-2 flex justify-center'>
                      <Button
                        variant='destructive'
                        size='icon-sm'
                        onClick={() => removeFromCart(item.id)}>
                        <Trash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className='grid grid-cols-2 gap-4'>
          {/* Discount */}
          <div>
            <label className='text-sm'>Discount</label>
            <Input
              type='number'
              disabled={cart.length === 0}
              min={0}
              max={100}
              value={discount}
              onChange={(e) =>
                setDiscount(Math.max(0, Math.min(100, Number(e.target.value))))
              }
            />
          </div>

          {/* Payment Method */}
          <div>
            <label className='text-sm'>Payment Method</label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Select Method' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='cash'>Cash</SelectItem>
                <SelectItem value='card'>Card</SelectItem>
                <SelectItem value='wallet'>Wallet</SelectItem>
                <SelectItem value='other'>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Totals */}
        <div className='border-t pt-2'>
          <div className='flex justify-between'>
            <span>Subtotal ({storeSettings?.currency})</span>
            <span>{subtotal.toFixed(2)}</span>
          </div>
          <div className='flex justify-between'>
            <span>Discount ({discount}%)</span>
            <span>{discountPercent.toFixed(2)}</span>
          </div>
          <div className='flex justify-between font-bold'>
            <span>Total</span>
            <span>{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className='flex gap-2'>
          <Button
            className='flex-1'
            disabled={cart.length === 0}
            onClick={handleSubmit}>
            Submit
          </Button>
          {!receiptGenerated && lastSaleData && (
            <Button
              className='flex-1'
              variant='secondary'
              disabled={cart.length === 0}
              onClick={handleGenerateReceipt}>
              Generate Receipt
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

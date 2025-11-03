// import { useState } from "react";

// export default function OrderButton({ order }: { order: SaleItem }) {
//   const [status, setStatus] = useState("");

//   const handlePay = async () => {
//     setStatus("Printing...");
//     const result = await window.api.sales.printReceipt(order);
//     if (result.success) {
//       setStatus("Receipt Printed ✅");
//     } else {
//       setStatus("Error: " + result.error);
//     }
//   };

//   return (
//     <div>
//       <button
//         onClick={handlePay}
//         className='bg-blue-500 text-white px-4 py-2 rounded'>
//         Pay & Print Receipt
//       </button>
//       <p className='mt-2 text-gray-700'>{status}</p>
//     </div>
//   );
// }

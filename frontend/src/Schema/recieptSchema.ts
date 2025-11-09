import { z } from "zod";

const socialLinkSchema = z.object({
  name: z.string().min(1, "Social name is required"),
  link: z.string().url("Must be a valid URL"),
  iconPath: z.string().min(1, "Icon path is required"),
});

// ✅ Main schema - using z.number() with transform for input handling
export const printDataSchema = z.object({
  logoPath: z.string().min(1, "Logo path is required"),
  storetype: z.enum(["general", "clothing", "food"]),
  storeName: z.string().min(1, "Store name is required"),
  storeAddress: z.string().min(1, "Store address is required"),
  phone_number: z.string().min(1, "Phone number is required"),
  website: z.string().url().optional().or(z.literal("")),
  discount: z.number().min(0, "Must be a valid number"),
  footerNote: z.string().min(1, "Footer note is required"),
  socials: z.array(socialLinkSchema),
  owner: z.string().min(1, "Owner name is required"),
  theme: z.enum(["light", "dark"]),
  currency: z.string().min(1, "Currency is required"),
  taxRate: z.number().min(0, "Must be a valid number"),
});

// ✅ Inferred type
export type PrintDataForm = z.infer<typeof printDataSchema>;

// ✅ Default Values
export const receiptDefaultValues: PrintDataForm = {
  logoPath: "",
  storeName:"AbdulDev",
  storetype: "general",
  storeAddress: "123 Main St, City, Country",
  phone_number: "+92 300 1234567",
  website: "https://abdulrehman.dev",
  discount: 0,
  footerNote: "Thank you for shopping with us!",
  socials: [],
  owner: "Abdul Rehman",
  theme: "dark",
  currency: "PKR",
  taxRate: 0,
};

export const printerSchema = z.object({
  vendorId: z
    .string()
    .min(1, "Vendor ID is required")
    .regex(/^0x[0-9A-Fa-f]+$/, "Must be in hex format like 0x04B8"),
  productId: z
    .string()
    .min(1, "Product ID is required")
    .regex(/^0x[0-9A-Fa-f]+$/, "Must be in hex format like 0x0202"),
});

export type PrinterFormValues = z.infer<typeof printerSchema>;
import { z } from "zod";

// -----------------------------------
// Base Schema (now a real z.object)
// -----------------------------------
const baseSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  category_id: z.union([z.string(), z.number()]).refine(
    (value) => (typeof value === "string" && value.length > 0) || (typeof value === "number" && value > 0),
    { message: "Category is required." }
  ),
  price: z.number().min(1, { message: "Price is required." }),
  cost_price: z.number().min(1, { message: "Cost Price is required." }),
  stock: z.number().min(1, { message: "Stock is required." }),
  barcode: z.string().nullable().optional(),
  sku: z.string().nullable().optional(),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  product_status: z.enum(["active", "archived", "draft"]),
  product_type: z.enum(["general", "clothing", "food"]),
  image_url: z.string().nullable().optional(),
});

// -----------------------------------
// Helper to apply price check
// -----------------------------------
const withPriceCheck = <T extends z.ZodTypeAny>(schema: T) =>
  schema.refine((data) => (data as z.infer<typeof baseSchema>).price > (data as z.infer<typeof baseSchema>).cost_price, {
    message: "Price must be greater than Cost Price.",
    path: ["price"],
  });

// -----------------------------------
// Discriminated Union
// -----------------------------------
export const formSchema = z.discriminatedUnion("product_type", [
  // General
  withPriceCheck(
    baseSchema.extend({
      product_type: z.literal("general"),
    })
  ),

  // Clothing
  withPriceCheck(
    baseSchema.extend({
      product_type: z.literal("clothing"),
      clothing: z.object({
        size: z.string().min(1, { message: "Size is required." }),
        color: z.string().min(1, { message: "Color is required." }),
        brand: z.string().min(1, { message: "Brand is required." }),
        material: z.string().min(1, { message: "Material is required." }),
      }),
    })
  ),

  // Food
  withPriceCheck(
    baseSchema.extend({
      product_type: z.literal("food"),
      food: z.object({
        recipe: z.string().min(1, { message: "Recipe is required." }),
        ingredients: z
          .array(z.string())
          .min(1, { message: "Ingredients are required." }),
        kitchen_required: z.enum(["true", "false"]),
      }),
    })
  ),
]);

// -----------------------------------
// Types
// -----------------------------------
export type ProductFormValues = z.infer<typeof formSchema>;
export type ProductType = ProductFormValues["product_type"];

// -----------------------------------
// Default Values Generator
// -----------------------------------
export const getProductDefaultValues = (
  type: ProductType
): ProductFormValues => {
  const baseDefaults = {
    id: undefined,
    name: "",
    category_id: "",
    price: 0,
    cost_price: 0,
    stock: 0,
    barcode: "",
    sku: "",
    description: "",
    image_url: null,
    product_status: "active" as const,
    product_type: type,
  };

  switch (type) {
    case "clothing":
      return {
        ...baseDefaults,
        product_type: "clothing",
        clothing: {
          size: "",
          color: "",
          brand: "",
          material: "",
        },
      };
    case "food":
      return {
        ...baseDefaults,
        product_type: "food",
        food: {
          recipe: "",
          ingredients: [],
          kitchen_required: 'true',
        },
      };
    case "general":
    default:
      return {
        ...baseDefaults,
        product_type: "general",
      };
  }
};

export const categoryDefaultValues = {
  name: "",
  description: "",
};

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

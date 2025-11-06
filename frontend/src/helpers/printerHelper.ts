import { toast } from "sonner";

/**
 * Detects if a thermal printer is connected.
 * Can be reused across components for consistent printer detection logic.
 *
 * @returns {Promise<boolean>} true if connected, false otherwise
 */
export async function detectPrinter({testMode = false} = {}): Promise<boolean> {
  try {
    const detected = await window.api.sales.printReceipt({ testMode });

    if (detected?.success) {
      toast.success("🖨️ Printer detected successfully!");
      return true;
    } else {
      toast.error(detected?.error || "⚠️ No printer detected.");
      return false;
    }
  } catch {
    toast.error("❌ Failed to detect printer.");
    return false;
  }
}

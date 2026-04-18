import { PrintOptions } from "../types/print.types";

export class PrintService {
  private static isPrinting = false;

  /**
   * Triggers browser print for the current window.
   * Leverages Portal-based isolation and CSS rules to show only the template.
   */
  static async print(options: PrintOptions = {}): Promise<void> {
    if (this.isPrinting) return;

    const {
      elementId,
      onBeforePrint,
      onAfterPrint,
      onError,
      waitForImages = true,
    } = options;

    try {
      this.isPrinting = true;
      if (onBeforePrint) onBeforePrint();

      // 1. Wait for the DOM to update (ensure template is rendered with fresh data)
      // This solves the "old print data" reported by the user.
      await new Promise((resolve) => setTimeout(resolve, 300));

      // 2. Wait for images in the target element if required
      if (waitForImages) {
        const target = elementId
          ? document.getElementById(elementId)
          : document.body;
        if (target) {
          await this.waitForImages(target);
        }
      }

      // 3. Trigger native print on main window
      window.print();

      if (onAfterPrint) onAfterPrint();
    } catch (err) {
      console.error("Print failed:", err);
      if (onError) onError(err as Error);
    } finally {
      this.isPrinting = false;
    }
  }

  private static async waitForImages(
    element: HTMLElement | Element,
  ): Promise<void> {
    const images = Array.from(element.getElementsByTagName("img"));
    const promises = images.map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    await Promise.all(promises);
    // Buffer for final layout stability
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}

export class PDFService {
  /**
   * Generates a PDF buffer from HTML content.
   * NOTE: Implementation currently disabled due to environment limitations (Puppeteer installation failed).
   */
  static async generate(html: string, options: any = {}): Promise<Buffer> {
    console.warn("PDF generation is currently disabled in this environment.");
    return Buffer.from("");
    /*
    let browser;
    try {
      const puppeteer = await import("puppeteer");
      browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true,
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 794, height: 1123 });
      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" },
        ...options,
      });

      return Buffer.from(pdf);
    } catch (error) {
      console.error("Puppeteer PDF generation failed:", error);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
    */
  }
}

import { NextRequest, NextResponse } from "next/server";
import { PDFService } from "@/modules/document/services/pdf.service";

/**
 * API Route for generating PDFs on the server.
 * Expects HTML content or a URL to render.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { html, fileName = "document" } = body;

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 },
      );
    }

    const pdfBuffer = await PDFService.generate(html);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF Generation Route Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 },
    );
  }
}

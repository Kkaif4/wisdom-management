import { NextResponse } from "next/server";
import { sendMail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { name, email, schoolName, description } = await req.json();

    if (!name || !email || !schoolName) {
      return NextResponse.json(
        { error: "Name, email, and school name are required." },
        { status: 400 }
      );
    }

    const adminEmail = process.env.SMTP_USER || "";
    if (!adminEmail) {
      return NextResponse.json(
        { error: "Mail service is not configured on the server." },
        { status: 500 }
      );
    }

    const emailSubject = `New Organization Registration Request: ${schoolName}`;
    const emailText = `
New registration request received from Wisdom Finance Landing Page.

Contact Name: ${name}
Contact Email: ${email}
School/Organization Name: ${schoolName}

Description/Details:
${description || "No description provided."}
    `;

    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; line-height: 1.5; color: #333;">
        <h2 style="color: #10b981; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">New Registration Inquiry</h2>
        <p>A new request has been submitted to list/register an organization on Wisdom Finance.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 150px;">Contact Name:</td>
            <td>${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">Contact Email:</td>
            <td><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold;">School Name:</td>
            <td>${schoolName}</td>
          </tr>
        </table>
        <h3 style="margin-top: 20px; color: #1f2937;">Message / Details:</h3>
        <p style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; white-space: pre-wrap; font-family: monospace;">${description || "No description provided."}</p>
      </div>
    `;

    await sendMail({
      to: adminEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    return NextResponse.json({ success: true, message: "Request sent successfully." });
  } catch (error: any) {
    console.error("Contact API Error:", error);
    return NextResponse.json(
      { error: "Failed to send the request. Please try again later." },
      { status: 500 }
    );
  }
}

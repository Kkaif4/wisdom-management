import { Printer, School } from "lucide-react";

const SchoolReceipt = () => {
  // Sample Data - In a real Next.js app, these would be props
  const receiptData = {
    receiptNo: "SCH/2024/1042",
    date: "October 24, 2024",
    schoolName: "EXCELLENCE PUBLIC SCHOOL",
    schoolAddress: "123 Education Lane, Knowledge District, State - 560001",
    schoolContact: "Phone: +91 12345 67890 | Email: accounts@excellence.edu",
    studentName: "Aditya Sharma",
    studentId: "STU-9921",
    classSection: "X - B",
    rollNo: "14",
    fatherName: "Rajesh Sharma",
    session: "2024-2025",
    fees: [
      { description: "Tuition Fees (Quarter 3)", amount: 12500 },
      { description: "Laboratory Charges", amount: 1500 },
      { description: "Library Maintenance", amount: 500 },
      { description: "Sports & Activities", amount: 1000 },
      { description: "Late Fine", amount: 0 },
    ],
  };

  const totalAmount = receiptData.fees.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  const amountToWords = (price: number) => {
    // Basic implementation for demo purposes
    return "Fifteen Thousand Five Hundred Only";
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col items-center font-sans text-gray-900">
      {/* Main Receipt Container */}
      <div className="bg-white w-full max-w-[800px] p-8 md:p-12 shadow-lg border border-gray-200 print:shadow-none print:border-none print:p-0">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center border-b-2 border-gray-800 pb-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <School size={40} className="text-gray-800" />
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight">
              {receiptData.schoolName}
            </h1>
          </div>
          <p className="text-sm text-gray-600">{receiptData.schoolAddress}</p>
          <p className="text-sm text-gray-600 font-medium mt-1">
            {receiptData.schoolContact}
          </p>
        </div>

        {/* Title and Metadata */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-lg font-bold border-b-2 border-gray-800 inline-block uppercase">
              Fee Receipt
            </h2>
          </div>
          <div className="text-right text-sm">
            <p>
              <span className="font-bold">Receipt No:</span>{" "}
              {receiptData.receiptNo}
            </p>
            <p>
              <span className="font-bold">Date:</span> {receiptData.date}
            </p>
            <p>
              <span className="font-bold">Session:</span> {receiptData.session}
            </p>
          </div>
        </div>

        {/* Student Information Grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-8 text-sm border p-4 bg-gray-50 rounded">
          <div className="flex">
            <span className="w-32 font-bold text-gray-700">Student Name:</span>
            <span className="border-b border-gray-300 flex-1">
              {receiptData.studentName}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 font-bold text-gray-700">Father's Name:</span>
            <span className="border-b border-gray-300 flex-1">
              {receiptData.fatherName}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 font-bold text-gray-700">
              Student ID/Adm:
            </span>
            <span className="border-b border-gray-300 flex-1">
              {receiptData.studentId}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 font-bold text-gray-700">Class & Sec:</span>
            <span className="border-b border-gray-300 flex-1">
              {receiptData.classSection}
            </span>
          </div>
          <div className="flex">
            <span className="w-32 font-bold text-gray-700">Roll Number:</span>
            <span className="border-b border-gray-300 flex-1">
              {receiptData.rollNo}
            </span>
          </div>
        </div>

        {/* Fee Breakdown Table */}
        <table className="w-full border-collapse border border-gray-800 mb-6 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 p-2 text-left w-12">
                S.No
              </th>
              <th className="border border-gray-800 p-2 text-left">
                Description of Fees
              </th>
              <th className="border border-gray-800 p-2 text-right w-32">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {receiptData.fees.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-800 p-2 text-center">
                  {index + 1}
                </td>
                <td className="border border-gray-800 p-2 uppercase">
                  {item.description}
                </td>
                <td className="border border-gray-800 p-2 text-right font-mono">
                  {item.amount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
            {/* Fill empty rows if needed to maintain height */}
            <tr className="h-10">
              <td className="border border-gray-800 p-2"></td>
              <td className="border border-gray-800 p-2 italic text-gray-400">
                Total payable amount
              </td>
              <td className="border border-gray-800 p-2 text-right font-bold font-mono">
                {totalAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                })}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Total in Words */}
        <div className="mb-12 text-sm italic">
          <p>
            <span className="font-bold not-italic underline">
              Amount in Words:
            </span>{" "}
            {amountToWords(totalAmount)}
          </p>
        </div>

        {/* Footer Signatures */}
        <div className="grid grid-cols-2 gap-12 text-sm mt-16 pt-4">
          <div className="text-center border-t border-gray-800 pt-2">
            <p className="font-bold">Parent/Guardian Signature</p>
          </div>
          <div className="text-center border-t border-gray-800 pt-2 flex flex-col items-center">
            <div className="h-12 flex items-center justify-center italic text-gray-400 opacity-50 mb-1">
              [Authorized Seal]
            </div>
            <p className="font-bold uppercase italic">Authorized Signatory</p>
            <p className="text-xs text-gray-500 font-normal italic">
              Computer Generated Receipt
            </p>
          </div>
        </div>

        {/* Terms/Note */}
        <div className="mt-8 text-[10px] text-gray-500 border-t pt-4 leading-tight">
          <p>
            Note: 1. Fees once paid are non-refundable. 2. Please preserve this
            receipt for future reference. 3. This is a computer generated
            document and does not require a physical signature if stamped by the
            institution.
          </p>
        </div>
      </div>

      {/* Global CSS for Printing */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .min-h-screen {
            background-color: white !important;
            display: block !important;
            padding: 0 !important;
          }
          button {
            display: none !important;
          }
          .shadow-lg {
            box-shadow: none !important;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default SchoolReceipt;

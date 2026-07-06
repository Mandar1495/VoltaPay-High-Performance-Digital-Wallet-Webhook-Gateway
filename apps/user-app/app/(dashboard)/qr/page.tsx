import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/client";
import { QRClient } from "./QRClient";

export default async function QRPage() {
  const session = await getServerSession(authOptions);
  const user = await prisma.user.findUnique({
    where: { id: Number(session?.user?.id) },
    select: { name: true, number: true },
  });

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 text-slate-800">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          QR <span className="text-violet-600">Payments</span>
        </h1>
        <p className="text-slate-500 mt-1">Scan QR codes to send funds instantly, or show your code to receive them.</p>
      </div>

      <QRClient 
        name={user?.name || "VoltPay User"} 
        number={user?.number || ""} 
      />
    </div>
  );
}

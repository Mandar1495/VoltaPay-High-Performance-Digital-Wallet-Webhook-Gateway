"use server";

import prisma from "@repo/db/client";

export async function simulateBankWebhook(token: string, userId: string, amount: number) {
  try {
    // 1. Fetch the transaction from the DB to verify it exists and is Processing
    const txn = await prisma.onRampTransaction.findUnique({
      where: { token }
    });

    if (!txn) {
      return { success: false, message: "Transaction not found." };
    }

    if (txn.status !== "Processing") {
      return { success: false, message: `Transaction has already been finalized with status: ${txn.status}.` };
    }

    // 2. Call the bank-webhook server running on port 3003
    const webhookUrl = process.env.BANK_WEBHOOK_URL || "http://localhost:3003/hdfcWebhook";
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
        user_identifier: userId,
        amount: amount.toString() // amount in cents/paise
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, message: `Webhook error: ${errorText || response.statusText}` };
    }

    const data = await response.json();
    return { success: true, message: data.message || "Callback successful!" };
  } catch (error: any) {
    console.error("Error in simulateBankWebhook:", error);
    return { success: false, message: error.message || "Failed to contact bank gateway." };
  }
}

export async function simulateBankWebhookFailure(token: string) {
  try {
    // Mark the transaction as Failure in the database
    await prisma.onRampTransaction.update({
      where: { token },
      data: { status: "Failure" }
    });
    return { success: true, message: "Transaction marked as failed." };
  } catch (error: any) {
    console.error("Error in simulateBankWebhookFailure:", error);
    return { success: false, message: error.message || "Failed to mark transaction as failed." };
  }
}

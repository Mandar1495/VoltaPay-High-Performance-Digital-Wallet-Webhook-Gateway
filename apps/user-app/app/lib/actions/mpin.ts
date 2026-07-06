"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";
import bcrypt from "bcrypt";

export async function hasMPin() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { hasPin: false, error: "Not authenticated" };
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { mpin: true },
  });

  return { hasPin: !!user?.mpin };
}

export async function setMPin(pin: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return { success: false, error: "Not authenticated" };
  }

  if (!/^\d{4}$/.test(pin)) {
    return { success: false, error: "PIN must be exactly 4 digits" };
  }

  const hashedPin = await bcrypt.hash(pin, 10);

  await prisma.user.update({
    where: { id: Number(userId) },
    data: { mpin: hashedPin },
  });

  return { success: true };
}

export async function verifyMPin(pin: string): Promise<boolean> {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { mpin: true },
  });

  if (!user || !user.mpin) {
    return false;
  }

  return await bcrypt.compare(pin, user.mpin);
}

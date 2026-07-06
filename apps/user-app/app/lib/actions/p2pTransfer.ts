 "use server"
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import prisma from "@repo/db/client";
import { verifyMPin } from "./mpin";

export async function p2pTransfer(to: string, amount: number, pin: string) {
    const session = await getServerSession(authOptions);
    const from = session?.user?.id;
    if (!from) {
        return {
            message: "Error while sending"
        }
    }

    // 1. Verify MPIN first
    const pinValid = await verifyMPin(pin);
    if (!pinValid) {
        return {
            message: "Incorrect Transaction MPIN"
        }
    }

    const toUser = await prisma.user.findFirst({
        where: {
            number: to
        }
    });

    if (!toUser) {
        return {
            message: "User not found"
        }
    }

    if (toUser.id === Number(from)) {
        return {
            message: "Cannot send money to yourself"
        }
    }

    try {
        let wonReward = false;
        let rewardId = 0;
        let rewardAmount = 0;

        await prisma.$transaction(async (tx) => {
             await tx.$queryRaw`SELECT * FROM "Balance" WHERE "userId" = ${Number(from)} FOR UPDATE`;

            const fromBalance = await tx.balance.findUnique({
                where: { userId: Number(from) },
              });
              if (!fromBalance || fromBalance.amount < amount) {
                throw new Error('Insufficient funds');
              }

              await tx.balance.update({
                where: { userId: Number(from) },
                data: { amount: { decrement: amount } },
              });

              await tx.balance.update({
                where: { userId: toUser.id },
                data: { amount: { increment: amount } },
              });

              await tx.p2pTransfer.create({
                data: {
                  fromUserId: Number(from), 
                  toUserId: toUser.id,
                  amount: amount,
                  timestamp: new Date() 
                }
            });

            // 2. Roll scratch card if amount is >= 10 INR (1000 paise)
            if (amount >= 1000) {
                // 100% chance for testing and demo!
                const chance = true;
                if (chance) {
                    // Random reward between 5 and 25 INR (500 and 2500 paise)
                    const rolledAmount = Math.floor(Math.random() * 2000) + 500;
                    const reward = await tx.reward.create({
                        data: {
                            userId: Number(from),
                            amount: rolledAmount,
                            isScratched: false
                        }
                    });
                    wonReward = true;
                    rewardId = reward.id;
                    rewardAmount = rolledAmount;
                }
            }
        });

        if (wonReward) {
            return {
                success: true,
                wonReward: true,
                rewardId,
                rewardAmount
            };
        }

        return {
            success: true
        };
    } catch (e: any) {
        return {
            message: e.message || "Failed to process transfer."
        };
    }
}
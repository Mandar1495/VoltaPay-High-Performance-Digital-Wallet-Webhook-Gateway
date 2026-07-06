import db from "@repo/db/client";
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt";

export const authOptions = {
    providers: [
      CredentialsProvider({
          name: 'Credentials',
          credentials: {
            phone: { label: "Phone number", type: "text", placeholder: "1231231231", required: true },
            password: { label: "Password", type: "password", required: true }
          },
          // TODO: User credentials type from next-aut
          async authorize(credentials: any) {
            // Do zod validation, OTP validation here
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const existingUser = await db.user.findFirst({
                where: {
                    number: credentials.phone
                }
            });

            if (existingUser) {
                if (credentials.action === "signup") {
                    throw new Error("User already exists with this phone number");
                }
                const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password);
                if (passwordValidation) {
                    return {
                        id: existingUser.id.toString(),
                        name: existingUser.name,
                        email: existingUser.number
                    }
                }
                return null;
            }

            if (credentials.action === "signin") {
                throw new Error("No account found with this phone number. Please Sign Up.");
            }

            try {
                const user = await db.user.create({
                    data: {
                        number: credentials.phone,
                        password: hashedPassword,
                        name: credentials.name || "VoltPay User"
                    }
                });
            
                // Create starter balance of ₹500 (50,000 paise) so they can test features immediately!
                await db.balance.create({
                    data: {
                        userId: user.id,
                        amount: 50000,
                        locked: 0
                    }
                });

                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.number
                }
            } catch(e) {
                console.error(e);
            }

            return null
          },
        })
    ],
    secret: process.env.JWT_SECRET || "secret",
    pages: {
      signIn: "/auth/signin"
    },
    callbacks: {
        async session({ token, session }: any) {
            if (session.user) {
                session.user.id = token.sub;
            }
            return session
        }
    }
  }
  
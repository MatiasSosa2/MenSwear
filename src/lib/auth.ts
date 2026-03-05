import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 horas
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        // Validar con Zod
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          const admin = await prisma.adminUser.findUnique({
            where: { email: email.toLowerCase().trim() },
          });

          if (!admin) return null;

          const isValid = await bcrypt.compare(password, admin.password);
          if (!isValid) return null;

          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            role: admin.role,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

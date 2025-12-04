import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import authService, { type LoginResponse } from "@/service/auth.service";

export const AUTH_SECRET = process.env.NEXTAUTH_SECRET ?? "dev-secret";

const apiLogin = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await authService.login({ email, password });
  if (!response.success || !response.data) {
    throw new Error(response.message || "Login failed");
  }
  return response.data as LoginResponse;
};

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const login = await apiLogin(credentials.email, credentials.password);

        return {
          id: login.user.id,
          email: login.user.email,
          role: login.user.role,
          status: login.user.status,
          rto_profile_id: login.user.rto_profile_id,
          accessToken: login.access_token,
          refreshToken: login.refresh_token,
          tokenType: login.token_type,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 20 * 60, // 20 minutes
  },
  jwt: {
    maxAge: 20 * 60, // 20 minutes
  },
  callbacks: {
    async jwt({ token, user }) {
      type AuthorizedUser = {
        role?: string;
        status?: string;
        rto_profile_id?: string | null;
        accessToken?: string;
        refreshToken?: string;
        tokenType?: string;
      };
      if (user) {
        const authUser = user as AuthorizedUser;
        token.role = authUser.role;
        token.status = authUser.status;
        token.rto_profile_id = authUser.rto_profile_id;
        token.accessToken = authUser.accessToken;
        token.refreshToken = authUser.refreshToken;
        token.tokenType = authUser.tokenType;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub,
        email: token.email,
        role: token.role as string | undefined,
        status: token.status as string | undefined,
        rto_profile_id: token.rto_profile_id as string | null | undefined,
      };
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      session.tokenType = token.tokenType as string | undefined;
      return session;
    },
  },
};

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
          id: login.user_id,
          email: login.email,
          role: login.role,
          accessToken: login.access_token,
          refreshToken: login.refresh_token,
          tokenType: login.token_type,
          mfaRequired: login.mfa_required,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      type AuthorizedUser = {
        role?: string;
        accessToken?: string;
        refreshToken?: string;
        tokenType?: string;
        mfaRequired?: boolean;
      };
      if (user) {
        const authUser = user as AuthorizedUser;
        token.role = authUser.role;
        token.accessToken = authUser.accessToken;
        token.refreshToken = authUser.refreshToken;
        token.tokenType = authUser.tokenType;
        token.mfaRequired = authUser.mfaRequired;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.sub,
        email: token.email,
        role: token.role as string | undefined,
      };
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      session.tokenType = token.tokenType as string | undefined;
      session.mfaRequired = token.mfaRequired as boolean | undefined;
      return session;
    },
  },
};

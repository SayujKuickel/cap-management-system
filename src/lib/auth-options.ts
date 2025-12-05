import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import authService, { type LoginResponse } from "@/service/auth.service";
import { JWT } from "next-auth/jwt";

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


async function refreshAccessToken(token: JWT) {
  try {
    // API expects refresh_token (not refreshToken)
    const response = await authService.refreshToken({ 
      refresh_token: token.refreshToken as string 
    });

    const refreshedTokens = response.data as LoginResponse;

    if (!response.success || !refreshedTokens) {
      throw new Error("Failed to refresh token");
    }

    // Decode JWT to get expiration time (access tokens are JWTs)
    let accessTokenExpires: number | undefined;
    try {
      const payload = JSON.parse(
        Buffer.from(refreshedTokens.access_token.split(".")[1], "base64").toString()
      );
      accessTokenExpires = payload.exp ? payload.exp * 1000 : undefined; // Convert to milliseconds
    } catch {
      // If we can't decode, set expiration to 20 minutes from now (default session time)
      accessTokenExpires = Date.now() + 20 * 60 * 1000;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      tokenType: refreshedTokens.token_type,
      accessTokenExpires,
      // Update user info if provided
      ...(refreshedTokens.user && {
        sub: refreshedTokens.user.id,
        email: refreshedTokens.user.email,
        role: refreshedTokens.user.role,
        status: refreshedTokens.user.status,
        rto_profile_id: refreshedTokens.user.rto_profile_id,
      }),
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return { ...token, error: "RefreshTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        microsoft_token: { label: "Microsoft Token", type: "text" },
      },
      async authorize(credentials) {
        // Support Microsoft OAuth tokens (when microsoft_token is provided)
        if (credentials?.microsoft_token) {
          try {
            const tokenData = JSON.parse(credentials.microsoft_token) as LoginResponse;
            return {
              id: tokenData.user.id,
              email: tokenData.user.email,
              role: tokenData.user.role,
              status: tokenData.user.status,
              rto_profile_id: tokenData.user.rto_profile_id,
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              tokenType: tokenData.token_type,
            };
          } catch (error) {
            console.error("Failed to parse Microsoft token:", error);
            return null;
          }
        }

        // Regular email/password login
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

      // Initial sign-in
      if (user) {
        const authUser = user as AuthorizedUser;
        
        // Decode access token to get expiration time
        let accessTokenExpires: number | undefined;
        if (authUser.accessToken) {
          try {
            const payload = JSON.parse(
              Buffer.from(authUser.accessToken.split(".")[1], "base64").toString()
            );
            accessTokenExpires = payload.exp ? payload.exp * 1000 : undefined; // Convert to milliseconds
          } catch {
            // If we can't decode, set expiration to 20 minutes from now
            accessTokenExpires = Date.now() + 20 * 60 * 1000;
          }
        }

        return {
          ...token,
          role: authUser.role,
          status: authUser.status,
          rto_profile_id: authUser.rto_profile_id,
          accessToken: authUser.accessToken,
          refreshToken: authUser.refreshToken,
          tokenType: authUser.tokenType,
          accessTokenExpires,
        };
      }

      // Return previous token if the access token has not expired yet
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to refresh it
      return refreshAccessToken(token);
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
      session.error = token.error as string | undefined; // Propagate refresh token errors
      return session;
    },
  },
};

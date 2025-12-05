import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    error?: string;
    user: {
      id?: string | null;
      email?: string | null;
      role?: string;
      status?: string;
      rto_profile_id?: string | null;
    };
  }

  interface User {
    role?: string;
    status?: string;
    rto_profile_id?: string | null;
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    status?: string;
    rto_profile_id?: string | null;
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

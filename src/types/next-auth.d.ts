import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    mfaRequired?: boolean;
    user: {
      id?: string | null;
      email?: string | null;
      role?: string;
    };
  }

  interface User {
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    mfaRequired?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenType?: string;
    mfaRequired?: boolean;
  }
}

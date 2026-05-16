import "next-auth";

declare module "next-auth" {
  interface User {
    nickname?: string;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      nickname: string;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nickname: string;
  }
}
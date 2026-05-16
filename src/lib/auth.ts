import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Kakao from "next-auth/providers/kakao";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Kakao({
      clientId: process.env.KAKAO_CLIENT_ID!,
      clientSecret: process.env.KAKAO_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          nickname: user.nickname,
          image: user.profileImage,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") return true;

      // OAuth 로그인: ���메일 기반으로 계정 자동 연동
      const email = user.email!;
      let dbUser = await prisma.user.findUnique({
        where: { email },
        include: { accounts: true },
      });

      if (!dbUser) {
        // 신��� 유저 생성
        const baseName = user.name || email.split("@")[0];
        let nickname = baseName.replace(/[^a-zA-Z0-9가-힣]/g, "").slice(0, 20);
        if (!nickname) nickname = email.split("@")[0].slice(0, 20);

        const existingNickname = await prisma.user.findUnique({ where: { nickname } });
        if (existingNickname) {
          nickname = `${nickname}${Date.now().toString(36).slice(-4)}`;
        }

        dbUser = await prisma.user.create({
          data: {
            email,
            name: user.name || baseName,
            nickname,
            profileImage: user.image,
          },
          include: { accounts: true },
        });
      }

      // 이 provider의 Account가 아직 없으면 연동
      const hasAccount = dbUser.accounts.some(
        (a) => a.provider === account.provider && a.providerAccountId === account.providerAccountId
      );

      if (!hasAccount) {
        await prisma.account.create({
          data: {
            userId: dbUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token as string | null,
            access_token: account.access_token as string | null,
            expires_at: account.expires_at,
            token_type: account.token_type,
            scope: account.scope,
            id_token: account.id_token as string | null,
            session_state: account.session_state as string | null,
          },
        });
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.nickname = dbUser.nickname;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.nickname = token.nickname as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
});

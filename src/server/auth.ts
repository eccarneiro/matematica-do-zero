import 'server-only';
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { db, schema } from './db';

/** Login só fica disponível com Google e banco configurados. */
// Remove espaços e quebras de linha que às vezes vêm junto ao colar as credenciais.
const googleId = process.env.AUTH_GOOGLE_ID?.trim();
const googleSecret = process.env.AUTH_GOOGLE_SECRET?.trim();

export const authEnabled = Boolean(googleId && googleSecret && process.env.AUTH_SECRET && db);

declare module 'next-auth' {
  interface Session {
    user: { id: string; name?: string | null; email?: string | null; image?: string | null };
  }
}

export const { handlers, auth } = NextAuth({
  providers: [Google({ clientId: googleId, clientSecret: googleSecret })],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Primeiro login nesta sessão: cria/atualiza o aluno.
      if (account?.provider === 'google' && db) {
        const id = `google:${account.providerAccountId}`;
        const values = { id, email: profile?.email ?? null, name: profile?.name ?? null, image: (profile?.picture as string | undefined) ?? null };
        await db.insert(schema.users).values(values).onConflictDoUpdate({
          target: schema.users.id,
          set: { email: values.email, name: values.name, image: values.image },
        });
        token.uid = id;
      }
      return token;
    },
    session({ session, token }) {
      if (typeof token.uid === 'string') session.user.id = token.uid;
      return session;
    },
  },
});

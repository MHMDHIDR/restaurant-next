import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET } = process.env

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!
    })
  ],
  secret: NEXTAUTH_SECRET
  // ,callbacks: {
  //   async signIn({ account, profile }: any) {
  //     if (account.provider === 'google') {
  //       return profile.email_verified
  //     }
  //   }
  // }
}

export default NextAuth(authOptions)

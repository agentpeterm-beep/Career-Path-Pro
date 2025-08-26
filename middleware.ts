
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to public routes
        if (
          req.nextUrl.pathname.startsWith('/auth/') ||
          req.nextUrl.pathname === '/' ||
          req.nextUrl.pathname.startsWith('/api/auth/') ||
          req.nextUrl.pathname.startsWith('/api/signup')
        ) {
          return true
        }
        // Require authentication for protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}

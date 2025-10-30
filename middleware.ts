import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Log de todas as requisições em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 ${request.method} ${pathname}`)
  }

  // Verificar autenticação para rotas protegidas
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    try {
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
      })

      if (!token) {
        console.log(`🔒 Acesso negado para ${pathname} - Token não encontrado`)
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }

      // Verificar se é rota de admin
      if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
        console.log(`🔒 Acesso negado para ${pathname} - Permissão insuficiente`)
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      console.log(`✅ Acesso autorizado para ${pathname} - Usuário: ${token.email}`)
    } catch (error) {
      console.error('❌ Erro no middleware de autenticação:', error)
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // Adicionar headers de debug em desenvolvimento
  const response = NextResponse.next()
  
  if (process.env.NODE_ENV === 'development') {
    response.headers.set('X-Debug-Timestamp', new Date().toISOString())
    response.headers.set('X-Debug-Path', pathname)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}

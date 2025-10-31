/**
 * Home Page - Landing Page for AgroInsight
 * 
 * This is the main landing page (route: /) that visitors see when they first arrive.
 * It serves as the marketing and entry point to the application.
 * 
 * Structure:
 * 1. Navigation bar - Logo, theme toggle, sign in/sign up links
 * 2. Hero section - Main headline and call-to-action buttons
 * 3. Features section - Key features displayed in a grid
 * 4. Footer - Branding and copyright
 * 
 * Features highlighted:
 * - Data validation for zootechnical research
 * - Unit normalization and conversion
 * - Collaborative review workflows
 * - Project management for research
 * 
 * Call-to-actions:
 * - "Iniciar Pesquisa" - Leads to sign up
 * - "Ver Demonstração" - Leads to demo page
 * - "Entrar" - Leads to sign in
 */

import Link from 'next/link'
import { Sprout, BarChart3, Users, Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

/**
 * HomePage component - Public landing page
 * Accessible to all visitors (not protected by authentication)
 */
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="bg-card shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Sprout className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-foreground">AgroInsight</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link
                href="/auth/signin"
                className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
              >
                Entrar
              </Link>
              <Link
                href="/auth/signup"
                className="bg-primary hover:brightness-110 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
              >
                Começar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Gestão Avançada de
            <span className="text-primary"> Dados Zootécnicos</span>
          </h1>
          <p className="text-xl text-foreground/70 mb-8 max-w-3xl mx-auto">
            Otimize suas pesquisas agropecuárias com validação inteligente de dados, 
            conversão automática de unidades e ferramentas de análise abrangentes para a pecuária moderna.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="bg-primary hover:brightness-110 text-primary-foreground px-8 py-3 rounded-lg text-lg font-medium"
            >
              Iniciar Pesquisa
            </Link>
            <Link
              href="/demo"
              className="border border-primary text-primary hover:bg-muted px-8 py-3 rounded-lg text-lg font-medium"
            >
              Ver Demonstração
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Tudo que você precisa para análise de dados zootécnicos
          </h2>
          <p className="text-lg text-foreground/70">
            Ferramentas poderosas desenvolvidas especificamente para pesquisadores e zootecnistas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Validação de Dados</h3>
            <p className="text-foreground/70">
              Validação automática de dados de peso bovino com intervalos e regras personalizáveis.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Normalização de Unidades</h3>
            <p className="text-foreground/70">
              Conversão inteligente de unidades e pré-processamento de dados para análise consistente.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Revisão Colaborativa</h3>
            <p className="text-foreground/70">
              Fluxo de trabalho colaborativo com supervisão administrativa e processos de aprovação.
            </p>
          </div>

          <div className="bg-card p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Sprout className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Gestão de Projetos</h3>
            <p className="text-foreground/70">
              Organize seus projetos de pesquisa com configurações e presets personalizáveis.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sprout className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-semibold text-foreground">AgroInsight</span>
            </div>
            <p className="text-foreground/70">
              © 2024 AgroInsight. Desenvolvido para excelência em pesquisa agropecuária.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

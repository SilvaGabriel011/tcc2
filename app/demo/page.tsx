import Link from 'next/link'
import { Sprout, ArrowRight, Database, BarChart3, Shield, Users } from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Sprout className="h-8 w-8 text-green-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">AgroInsight</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Fazer Login
              </Link>
              <Link
                href="/auth/signup"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Começar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Demonstração do AgroInsight
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore as funcionalidades da nossa plataforma de gestão de dados agrícolas
          </p>
        </div>

        {/* Demo Features */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Database className="h-8 w-8 text-green-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Gestão de Projetos</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Organize seus projetos de pesquisa com configurações personalizáveis e presets de upload.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Projeto de Exemplo:</h4>
              <p className="text-sm text-gray-600">
                <strong>Análise de Peso Bovino</strong><br />
                Validação automática de dados de peso com intervalos configuráveis
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Validação de Dados</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Sistema inteligente de validação com regras personalizáveis para diferentes tipos de dados.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Intervalos de Validação:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Peso nascimento: 1-60 kg</li>
                <li>• Peso desmame: 80-300 kg</li>
                <li>• Peso sobreano: 200-600 kg</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-8 w-8 text-purple-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Análise e Relatórios</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Ferramentas avançadas de análise com visualizações interativas e relatórios detalhados.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Recursos:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gráficos interativos</li>
                <li>• Exportação de dados</li>
                <li>• Análise estatística</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <Users className="h-8 w-8 text-orange-600 mr-3" />
              <h3 className="text-xl font-semibold text-gray-900">Fluxo de Revisão</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Sistema colaborativo de revisão com aprovação de curadores e auditoria completa.
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Funcionalidades:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Revisão obrigatória</li>
                <li>• Log de auditoria</li>
                <li>• Controle de acesso</li>
              </ul>
            </div>
          </div>
        </div>

        {/* API Demo */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">API RESTful</h3>
          <p className="text-gray-600 mb-6">
            Nossa API permite integração completa com sistemas externos e automação de workflows.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Endpoints Disponíveis:</h4>
              <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
                <div className="text-green-600">GET /api/project/{'{id}'}/upload-presets</div>
                <div className="text-blue-600">PUT /api/project/{'{id}'}/upload-presets</div>
                <div className="text-purple-600">POST /api/auth/signup</div>
                <div className="text-orange-600">GET /api/test</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Exemplo de Resposta:</h4>
              <div className="bg-gray-50 p-4 rounded-md font-mono text-xs overflow-x-auto">
                <pre className="text-gray-700">{`{
  "projectId": "sample-project-1",
  "presets": [{
    "intervals": {
      "Peso_nascimento_kg": {
        "min": 1, "max": 60
      }
    },
    "reviewRequired": true
  }]
}`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            Pronto para começar?
          </h3>
          <p className="text-gray-600 mb-8">
            Experimente o AgroInsight com uma conta gratuita e veja como podemos ajudar sua pesquisa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Criar Conta Gratuita
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex items-center px-6 py-3 border border-green-600 text-base font-medium rounded-md text-green-600 bg-white hover:bg-green-50"
            >
              Fazer Login
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Contas de demonstração disponíveis:</p>
            <p>Admin: admin@agroinsight.com | Pesquisador: researcher@agroinsight.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}

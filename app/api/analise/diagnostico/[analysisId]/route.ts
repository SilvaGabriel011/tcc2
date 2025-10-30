import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function GET(
  request: NextRequest,
  { params }: { params: { analysisId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const analysisId = params.analysisId

    // Buscar análise no banco garantindo propriedade do projeto
    const analysis = await prisma.dataset.findFirst({
      where: {
        id: analysisId,
        project: {
          ownerId: session.user.id
        }
      }
    })

    if (!analysis) {
      return NextResponse.json({ error: 'Análise não encontrada' }, { status: 404 })
    }

    const data = JSON.parse(analysis.data)
    const metadata = analysis.metadata ? JSON.parse(analysis.metadata) : {}

    // Gerar diagnóstico com Gemini Pro
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `Você é um ZOOTECNISTA SÊNIOR com 30 anos de experiência em pecuária de corte e leite, especializado em:
- Nutrição e manejo alimentar de bovinos
- Reprodução e melhoramento genético
- Análise de indicadores zootécnicos
- Gestão de fazendas e análise econômica
- Sanidade e bem-estar animal
- Interpretação de dados estatísticos aplicados à zootecnia

Você possui formação acadêmica completa (graduação, mestrado e doutorado em Zootecnia), trabalha como consultor técnico e professor universitário.

**DADOS DA ANÁLISE:**
Nome do Dataset: ${analysis.name}
Total de Registros: ${metadata.totalRows || 'N/A'}
Total de Colunas: ${metadata.totalColumns || 'N/A'}
Registros Válidos: ${metadata.validRows || 'N/A'}
Variáveis Zootécnicas Identificadas: ${metadata.zootechnicalCount || data.zootechnicalVariables?.length || 0}

**VARIÁVEIS DETECTADAS E TIPOS:**
${JSON.stringify(data.variablesInfo || {}, null, 2)}

**ESTATÍSTICAS NUMÉRICAS:**
${JSON.stringify(data.numericStats || {}, null, 2)}

**ESTATÍSTICAS CATEGÓRICAS:**
${JSON.stringify(data.categoricalStats || {}, null, 2)}

**SUA TAREFA:**
Analise esses dados zootécnicos profundamente e forneça um DIAGNÓSTICO TÉCNICO COMPLETO em formato estruturado:

1. **RESUMO EXECUTIVO** (2-3 frases)
   - Síntese do que foi analisado

2. **ANÁLISE DAS VARIÁVEIS NUMÉRICAS**
   - Para cada variável zootécnica numérica importante:
     * Interprete a média, mediana e desvio padrão
     * Comente sobre o coeficiente de variação (CV%)
     * Avalie se há outliers preocupantes
     * Compare com padrões ideais da literatura zootécnica
     * Identifique pontos positivos e negativos

3. **ANÁLISE DAS VARIÁVEIS CATEGÓRICAS**
   - Para cada variável categórica:
     * Interprete a distribuição
     * Comente sobre o valor mais comum
     * Avalie a diversidade (entropia)

4. **PONTOS FORTES DO REBANHO/SISTEMA**
   - Liste 3-5 pontos positivos baseados nos dados
   - Justifique tecnicamente cada ponto

5. **PONTOS DE ATENÇÃO/MELHORIAS**
   - Liste 3-5 aspectos que necessitam atenção
   - Explique por que são preocupantes
   - Sugira ações corretivas específicas

6. **RECOMENDAÇÕES TÉCNICAS PRIORITÁRIAS**
   - 5 recomendações práticas e implementáveis
   - Ordenadas por prioridade
   - Com justificativa técnica

7. **CONCLUSÃO E PERSPECTIVAS**
   - Avaliação geral do status do rebanho/sistema
   - Potencial produtivo identificado
   - Principais oportunidades de melhoria

**IMPORTANTE:**
- Use linguagem técnica mas acessível
- Cite valores numéricos específicos dos dados
- Faça comparações com padrões da literatura quando apropriado
- Seja ESPECÍFICO e PRÁTICO nas recomendações
- Se algum dado estiver fora do esperado, EXPLIQUE o porquê
- Mantenha tom profissional mas educativo

Retorne o diagnóstico em formato JSON estruturado:
{
  "resumoExecutivo": "texto",
  "analiseNumericas": [
    {
      "variavel": "nome",
      "interpretacao": "texto detalhado",
      "comparacaoLiteratura": "texto",
      "status": "Excelente/Bom/Regular/Preocupante"
    }
  ],
  "analiseCategoricas": [...],
  "pontosFortes": ["ponto 1 com justificativa", "ponto 2...", ...],
  "pontosAtencao": [...],
  "recomendacoesPrioritarias": [
    {
      "prioridade": 1,
      "titulo": "título da recomendação",
      "descricao": "descrição detalhada",
      "justificativa": "justificativa técnica"
    }
  ],
  "conclusao": "texto conclusivo"
}

Retorne APENAS o JSON, sem texto adicional.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extrair JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Resposta inválida do Gemini')
    }

    const diagnostico = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      diagnostico,
      geradoEm: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erro ao gerar diagnóstico:', error)
    return NextResponse.json(
      { error: 'Erro ao gerar diagnóstico. Tente novamente.' },
      { status: 500 }
    )
  }
}

import { z } from 'zod'


export const signupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})


export const uploadFormDataSchema = z.object({
  projectId: z.string().uuid().optional(),
})

export const multiSpeciesUploadFormDataSchema = z.object({
  species: z.enum([
    'bovine', 'swine', 'poultry', 'sheep', 
    'goat', 'aquaculture', 'forage'
  ], {
    errorMap: () => ({ message: 'Espécie inválida' })
  }),
  subtype: z.string().optional(),
  projectId: z.string().uuid().optional(),
})


export const diagnosticRequestSchema = z.object({
  forceRegenerate: z.boolean().optional().default(false),
})

export const correlationRequestSchema = z.object({
  datasetId: z.string().uuid('ID do dataset inválido'),
  variables: z.array(z.string()).min(2, 'Pelo menos 2 variáveis são necessárias'),
  method: z.enum(['pearson', 'spearman']).optional().default('pearson'),
})


export const searchReferencesSchema = z.object({
  query: z.string().min(3, 'Consulta deve ter pelo menos 3 caracteres'),
  source: z.enum(['all', 'scholar', 'crossref', 'pubmed', 'embrapa']).optional().default('all'),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
  yearFrom: z.coerce.number().int().min(1900).max(2100).optional(),
  yearTo: z.coerce.number().int().min(1900).max(2100).optional(),
  language: z.enum(['pt', 'en', 'es', 'all']).optional().default('all'),
  publicationType: z.enum(['research', 'review', 'meta-analysis', 'case-study', 'all']).optional(),
})

export const saveReferenceSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  authors: z.array(z.string()).min(1, 'Pelo menos um autor é obrigatório'),
  year: z.number().int().min(1900).max(2100),
  abstract: z.string().optional(),
  journal: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().url('URL inválida').optional(),
  keywords: z.array(z.string()).optional(),
  source: z.enum(['scielo', 'crossref', 'manual']),
})

export const unsaveReferenceSchema = z.object({
  referenceId: z.string().uuid('ID da referência inválido'),
})

export const addReferenceByUrlSchema = z.object({
  url: z.string().url('URL inválida'),
})


export const laymanEvaluateSchema = z.object({
  species: z.string().min(1, 'Espécie é obrigatória'),
  subtype: z.string().optional(),
  metrics: z.record(z.number()),
  farmId: z.string().uuid().optional(),
})


export const createProjectSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
})

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})


export const dashboardStatsQuerySchema = z.object({
  period: z.enum(['week', 'month', 'year', 'all']).optional().default('month'),
})


export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UploadFormDataInput = z.infer<typeof uploadFormDataSchema>
export type MultiSpeciesUploadFormDataInput = z.infer<typeof multiSpeciesUploadFormDataSchema>
export type DiagnosticRequestInput = z.infer<typeof diagnosticRequestSchema>
export type CorrelationRequestInput = z.infer<typeof correlationRequestSchema>
export type SearchReferencesInput = z.infer<typeof searchReferencesSchema>
export type SaveReferenceInput = z.infer<typeof saveReferenceSchema>
export type UnsaveReferenceInput = z.infer<typeof unsaveReferenceSchema>
export type AddReferenceByUrlInput = z.infer<typeof addReferenceByUrlSchema>
export type LaymanEvaluateInput = z.infer<typeof laymanEvaluateSchema>
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type DashboardStatsQueryInput = z.infer<typeof dashboardStatsQuerySchema>

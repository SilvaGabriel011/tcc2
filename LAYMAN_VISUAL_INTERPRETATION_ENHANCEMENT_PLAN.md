# Enhanced Layman Visual Interpretation System - Architectural Plan

## Executive Summary

This document outlines the comprehensive architecture for enhancing AgroInsight's layman visualization system to interpret data/graphics into simplified visual representations using animal silhouettes (seals) and colors for lay audiences. The enhancement will transform the current basic color-coded system into an intelligent interpretation engine that provides actionable insights and enables users to create action plans based on analysis.

**Current State**: Basic layman visualization with color-coding (red/yellow/green) and animal silhouettes exists but lacks detailed problem identification, actionable insights, and integration with multi-species analysis.

**Target State**: Comprehensive visual interpretation system that clearly communicates "your production is bad in X, Y, and Z, and good in A" with species-specific drawings, practical recommendations, and action plan generation.

---

## Table of Contents

1. [Research Findings](#research-findings)
2. [System Gaps Analysis](#system-gaps-analysis)
3. [Architecture Overview](#architecture-overview)
4. [Data Normalization Layer](#data-normalization-layer)
5. [Enhanced Interpretation Engine](#enhanced-interpretation-engine)
6. [Visual Representation System](#visual-representation-system)
7. [Action Plan Generation](#action-plan-generation)
8. [Fault Injection Layer](#fault-injection-layer)
9. [API Contracts](#api-contracts)
10. [Implementation Roadmap](#implementation-roadmap)
11. [Testing Strategy](#testing-strategy)
12. [Success Metrics](#success-metrics)

---

## 1. Research Findings

### 1.1 Existing System Components

**✅ Components That Exist:**
- `lib/layman/types.ts` - Type definitions for layman system
- `lib/layman/colors.ts` - Universal color system (red/yellow/green)
- `services/layman.service.ts` - API client for layman operations
- `components/layman/LaymanTab.tsx` - Main layman visualization container
- `components/layman/AnimalSilhouettes.tsx` - SVG silhouettes for 6 species (bovine, swine, poultry, sheep, goat, fish)
- `components/layman/ForagePanel.tsx` - Forage/pasture visualization
- `components/layman/MetricCard.tsx` - Individual metric display
- `components/layman/ColorLegend.tsx` - Color legend component
- `app/api/layman/evaluate/route.ts` - Metric evaluation endpoint
- `app/api/layman/annotations/[entityId]/route.ts` - Annotations endpoint (returns mock data)
- `app/api/analysis/multi-species/route.ts` - Multi-species analysis with basic interpretation
- `app/api/reference/[species]/data/route.ts` - Reference data API
- `lib/references/species-references.ts` - ReferenceDataService with validation logic
- `lib/references/nrc-data.ts` - NRC reference data (hardcoded)
- `lib/references/embrapa-data.ts` - EMBRAPA reference data (hardcoded)

**❌ Components That Are Missing:**
- `lib/interpretation/enhanced-layman.ts` - Enhanced interpretation engine (referenced in docs but not implemented)
- `app/api/interpretation/enhanced/route.ts` - Enhanced interpretation API
- `app/api/layman/thresholds/route.ts` - Thresholds management API (service expects it but doesn't exist)
- `app/api/layman/thresholds/history/route.ts` - Threshold history API
- `lib/layman/normalizer.ts` - Metric name normalization layer
- `lib/layman/evaluator.ts` - Standalone evaluation engine
- Action plan generation system
- Species-specific problem area highlighting
- Practical analogies generator
- Fault injection layer for testing

### 1.2 Integration Points

**Current Integration:**
- Results page (`app/dashboard/resultados/page.tsx`) already imports and uses `LaymanTab` component
- Multi-species analysis API generates basic interpretation with insights and recommendations
- Reference data service provides validation against NRC/EMBRAPA standards
- Layman service converts analysis data to evaluation requests

**Integration Gaps:**
- No connection between multi-species analysis interpretation and layman visualization
- Missing meta_peso_kg field in metric conversion (peso_vs_meta_pct calculation fails)
- Inconsistent metric naming across different analysis types
- No unified interpretation pipeline

### 1.3 Key Technical Challenges Identified

1. **Data Normalization**: Different CSV uploads use different column names (GPD, gmd_7d, gmd_30d, ganho_peso_diario) - need canonical mapping
2. **Threshold Governance**: DEFAULT_THRESHOLDS hardcoded in evaluate route; need per-farm, per-species, versioned thresholds
3. **Metric Mapping**: peso_vs_meta requires meta_peso_kg but convertAnalysisToEvaluation never sets it
4. **Species Scalability**: Adding new species requires code changes instead of configuration
5. **Interpretation Quality**: Current system shows overall status but doesn't identify specific problem areas
6. **Actionability**: No clear path from "production is bad" to "here's what to do"

---

## 2. System Gaps Analysis

### 2.1 Critical Gaps

**Gap 1: No Actionable Insights**
- **Current**: Shows overall color (red/yellow/green) and metric summaries
- **Missing**: Specific problem identification ("GPD is 30% below target"), root cause analysis, prioritized action items
- **Impact**: Users see problems but don't know what to do

**Gap 2: Limited Visual Communication**
- **Current**: Single-color silhouette with overall status
- **Missing**: Visual indicators of specific problem areas (e.g., highlighting body regions), comparative visualizations
- **Impact**: Lay audiences can't quickly identify what's wrong

**Gap 3: No Action Plan Generation**
- **Current**: Multi-species API generates basic recommendations as strings
- **Missing**: Structured action plans with priorities, dependencies, estimated impact, and implementation steps
- **Impact**: Users can't translate insights into concrete actions

**Gap 4: Inconsistent Metric Handling**
- **Current**: Different metric names across species and upload formats
- **Missing**: Canonical metric dictionary with synonyms and unit conversions
- **Impact**: Evaluation fails or produces incorrect results

**Gap 5: Missing Threshold Management**
- **Current**: Hardcoded thresholds in API route
- **Missing**: Database-backed, versioned, per-farm threshold configuration
- **Impact**: Can't customize evaluation criteria per farm

### 2.2 Integration Bugs

**Bug 1: Missing meta_peso_kg**
- **Location**: `services/layman.service.ts:193-201`
- **Issue**: convertAnalysisToEvaluation doesn't set meta_peso_kg, so peso_vs_meta_pct is never calculated
- **Fix**: Determine source for target weight (dataset metadata, project preset, or species reference)

**Bug 2: Annotations Endpoint Returns Mock Data**
- **Location**: `app/api/layman/annotations/[entityId]/route.ts:36-52`
- **Issue**: Always returns mock data with TODO comment
- **Fix**: Implement actual annotation retrieval from database or generate on-demand

**Bug 3: Thresholds API Missing**
- **Location**: `services/layman.service.ts:104-161` calls endpoints that don't exist
- **Issue**: getFarmThresholds, updateFarmThresholds, getThresholdHistory call non-existent routes
- **Fix**: Implement threshold management APIs

---

## 3. Architecture Overview

### 3.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ResultadosPage (Tabs: Technical | Layman)              │  │
│  │    └─ LaymanTab Component                                │  │
│  │         ├─ Summary Sentence                              │  │
│  │         ├─ Animal Silhouette (color-coded)              │  │
│  │         ├─ Top 3 Issues Panel                            │  │
│  │         ├─ Metric Cards                                  │  │
│  │         └─ Action Plan Panel                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LaymanService                                           │  │
│  │    ├─ evaluateMetrics()                                  │  │
│  │    ├─ getEnhancedInterpretation()                       │  │
│  │    └─ getFarmThresholds()                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ /api/layman/     │  │ /api/interpre-   │  │ /api/layman/ │ │
│  │   evaluate       │  │   tation/        │  │   thresholds │ │
│  │                  │  │   enhanced       │  │              │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    INTERPRETATION ENGINE                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Normalization Layer                                  │  │
│  │     └─ MetricNormalizer (canonical names, units)        │  │
│  │                                                           │  │
│  │  2. Evaluation Engine                                    │  │
│  │     ├─ ThresholdService (versioned, per-farm)          │  │
│  │     └─ MetricEvaluator (categorization)                │  │
│  │                                                           │  │
│  │  3. Interpretation Engine                                │  │
│  │     ├─ ProblemIdentifier (top issues)                   │  │
│  │     ├─ NarrativeGenerator (plain language)             │  │
│  │     └─ AnalogyGenerator (practical comparisons)        │  │
│  │                                                           │  │
│  │  4. Action Plan Generator                                │  │
│  │     ├─ SpeciesPlaybooks (config-driven)                │  │
│  │     ├─ PriorityEngine (severity + impact)              │  │
│  │     └─ DependencyResolver (action sequencing)          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │
│  │ ReferenceData    │  │ Thresholds       │  │ ActionPlay-  │ │
│  │ Service          │  │ (DB + Cache)     │  │ books (JSON) │ │
│  │ (NRC/EMBRAPA)    │  │                  │  │              │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Design Principles

1. **Separation of Concerns**: Normalization → Evaluation → Interpretation → Action Planning
2. **Configuration Over Code**: New species/metrics via JSON configs, not code changes
3. **Graceful Degradation**: System works with partial data; missing thresholds fall back to defaults
4. **Testability**: Each layer independently testable with fault injection
5. **Extensibility**: Strategy pattern for species-specific logic
6. **Performance**: Caching at threshold and reference data layers

---

## 4. Data Normalization Layer

### 4.1 Metric Name Normalization

**Problem**: Different uploads use different column names for the same metric.

**Solution**: Canonical metric dictionary with synonyms.

```typescript
// lib/layman/normalizer.ts

export interface MetricSynonym {
  canonical: string
  synonyms: string[]
  unit: string
  alternateUnits?: { unit: string; conversionFactor: number }[]
}

export const METRIC_DICTIONARY: Record<string, MetricSynonym> = {
  // Weight gain metrics
  'gpd': {
    canonical: 'gpd',
    synonyms: ['GPD', 'gmd_7d', 'gmd_30d', 'ganho_peso_diario', 'daily_gain'],
    unit: 'kg/dia',
    alternateUnits: [
      { unit: 'g/dia', conversionFactor: 0.001 }
    ]
  },
  
  // Body condition score
  'bcs': {
    canonical: 'bcs',
    synonyms: ['BCS', 'escore_corporal', 'ESCORE_CORPORAL', 'body_condition'],
    unit: '',
    alternateUnits: []
  },
  
  // Milk production
  'producao_leite': {
    canonical: 'producao_leite',
    synonyms: ['PRODUCAO_LEITE', 'milk_production', 'leite', 'producao'],
    unit: 'L/dia',
    alternateUnits: []
  },
  
  // Weight
  'peso': {
    canonical: 'peso_kg',
    synonyms: ['peso', 'PESO_ATUAL_KG', 'peso_atual_kg', 'weight', 'peso_vivo'],
    unit: 'kg',
    alternateUnits: [
      { unit: 'g', conversionFactor: 0.001 },
      { unit: 'lb', conversionFactor: 0.453592 }
    ]
  },
  
  // Feed conversion
  'conversao_alimentar': {
    canonical: 'conversao_alimentar',
    synonyms: ['conversao', 'FCR', 'fcr', 'feed_conversion'],
    unit: '',
    alternateUnits: []
  },
  
  // Mortality
  'mortalidade': {
    canonical: 'mortalidade',
    synonyms: ['MORTALIDADE', 'mortality', 'taxa_mortalidade'],
    unit: '%',
    alternateUnits: []
  },
  
  // Forage metrics
  'biomassa_kg_ha': {
    canonical: 'biomassa_kg_ha',
    synonyms: ['BIOMASSA_KG_HA', 'biomassa', 'biomass'],
    unit: 'kg/ha',
    alternateUnits: []
  },
  
  'cobertura_pct': {
    canonical: 'cobertura_pct',
    synonyms: ['COBERTURA_PCT', 'cobertura', 'coverage'],
    unit: '%',
    alternateUnits: []
  }
}

export interface NormalizationResult {
  metric_values: Record<string, number>
  metadata: {
    originalKeys: Record<string, string> // canonical -> original
    conversions: Array<{
      metric: string
      originalValue: number
      originalUnit: string
      convertedValue: number
      convertedUnit: string
    }>
  }
  warnings: string[]
}

export class MetricNormalizer {
  /**
   * Normalize metric names and units to canonical form
   */
  static normalize(
    data: Record<string, number>,
    species: string,
    subtype?: string
  ): NormalizationResult {
    const result: NormalizationResult = {
      metric_values: {},
      metadata: {
        originalKeys: {},
        conversions: []
      },
      warnings: []
    }
    
    for (const [key, value] of Object.entries(data)) {
      // Find canonical name
      const canonical = this.findCanonicalName(key)
      
      if (!canonical) {
        result.warnings.push(`Unknown metric: ${key}`)
        continue
      }
      
      result.metadata.originalKeys[canonical] = key
      
      // Check if unit conversion needed (future enhancement)
      result.metric_values[canonical] = value
    }
    
    // Add derived metrics
    this.addDerivedMetrics(result, species, subtype)
    
    return result
  }
  
  /**
   * Find canonical name for a metric
   */
  private static findCanonicalName(key: string): string | null {
    const lowerKey = key.toLowerCase()
    
    for (const [canonical, config] of Object.entries(METRIC_DICTIONARY)) {
      if (canonical.toLowerCase() === lowerKey) {
        return canonical
      }
      
      for (const synonym of config.synonyms) {
        if (synonym.toLowerCase() === lowerKey) {
          return canonical
        }
      }
    }
    
    return null
  }
  
  /**
   * Add derived metrics (e.g., peso_vs_meta_pct)
   */
  private static addDerivedMetrics(
    result: NormalizationResult,
    species: string,
    subtype?: string
  ): void {
    // Calculate peso_vs_meta_pct if we have peso and meta
    if (result.metric_values.peso_kg && result.metric_values.meta_peso_kg) {
      result.metric_values.peso_vs_meta_pct = 
        result.metric_values.peso_kg / result.metric_values.meta_peso_kg
    } else if (result.metric_values.peso_kg) {
      // Get target weight from species reference
      const targetWeight = this.getTargetWeight(species, subtype)
      if (targetWeight) {
        result.metric_values.meta_peso_kg = targetWeight
        result.metric_values.peso_vs_meta_pct = 
          result.metric_values.peso_kg / targetWeight
        result.warnings.push(`Using default target weight: ${targetWeight}kg`)
      }
    }
  }
  
  /**
   * Get target weight from species reference data
   */
  private static getTargetWeight(species: string, subtype?: string): number | null {
    // This would query reference data for typical target weights
    // For now, return hardcoded defaults
    const targets: Record<string, Record<string, number>> = {
      bovine: {
        dairy: 550,
        beef: 450,
        dual: 500
      },
      swine: {
        nursery: 25,
        growing: 60,
        finishing: 110
      },
      poultry: {
        broiler: 2.8,
        layer: 1.8
      }
    }
    
    return targets[species]?.[subtype || 'default'] || null
  }
}
```

### 4.2 Integration with Existing Service

Update `services/layman.service.ts`:

```typescript
import { MetricNormalizer } from '@/lib/layman/normalizer'

convertAnalysisToEvaluation(
  analysisData: Record<string, unknown>,
  entityType: EntityType,
  farmId: string = 'default_farm'
): EvaluationRequest {
  // Extract numeric stats
  const numericStats = analysisData.numericStats as Record<string, { mean?: number }>
  const rawMetrics: Record<string, number> = {}
  
  for (const [key, stats] of Object.entries(numericStats || {})) {
    if (stats.mean !== undefined) {
      rawMetrics[key] = stats.mean
    }
  }
  
  // Normalize metrics
  const normalized = MetricNormalizer.normalize(
    rawMetrics,
    entityType === 'gado' ? 'bovine' : entityType,
    undefined // TODO: extract subtype from metadata
  )
  
  return {
    entity_id: `analysis_${Date.now()}`,
    farm_id: farmId,
    entity_type: entityType,
    metric_values: normalized.metric_values
  }
}
```

---

## 5. Enhanced Interpretation Engine

### 5.1 Problem Identification

```typescript
// lib/interpretation/problem-identifier.ts

export interface ProblemArea {
  metric: string
  displayName: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  currentValue: number
  targetRange: { min: number; max: number }
  deviation: number // percentage deviation from ideal
  impact: string // user-friendly impact description
  category: 'production' | 'health' | 'nutrition' | 'management'
}

export class ProblemIdentifier {
  /**
   * Identify top problems from metric evaluations
   */
  static identifyProblems(
    metricSummaries: MetricSummary[],
    species: string,
    subtype?: string
  ): ProblemArea[] {
    const problems: ProblemArea[] = []
    
    for (const summary of metricSummaries) {
      if (summary.category === 'ruim') {
        const reference = ReferenceDataService.getReference(
          species,
          subtype,
          summary.metric_key
        ) as ReferenceMetric
        
        if (!reference) continue
        
        const deviation = this.calculateDeviation(
          summary.value,
          reference
        )
        
        problems.push({
          metric: summary.metric_key,
          displayName: this.getDisplayName(summary.metric_key),
          severity: this.calculateSeverity(deviation, summary.metric_key),
          currentValue: summary.value,
          targetRange: {
            min: reference.ideal_min || reference.min,
            max: reference.ideal_max || reference.max
          },
          deviation,
          impact: this.getImpactDescription(summary.metric_key, species),
          category: this.categorizeMetric(summary.metric_key)
        })
      }
    }
    
    // Sort by severity and deviation
    return problems.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity]
      }
      return Math.abs(b.deviation) - Math.abs(a.deviation)
    })
  }
  
  private static calculateDeviation(
    value: number,
    reference: ReferenceMetric
  ): number {
    const ideal = reference.ideal_min && reference.ideal_max
      ? (reference.ideal_min + reference.ideal_max) / 2
      : reference.ideal || (reference.min + reference.max) / 2
    
    return ((value - ideal) / ideal) * 100
  }
  
  private static calculateSeverity(
    deviation: number,
    metric: string
  ): 'critical' | 'high' | 'medium' | 'low' {
    const absDeviation = Math.abs(deviation)
    
    // Critical metrics (mortality, severe malnutrition)
    if (['mortalidade', 'bcs'].includes(metric)) {
      if (absDeviation > 50) return 'critical'
      if (absDeviation > 30) return 'high'
      if (absDeviation > 15) return 'medium'
      return 'low'
    }
    
    // Production metrics
    if (absDeviation > 40) return 'high'
    if (absDeviation > 25) return 'medium'
    return 'low'
  }
  
  private static getDisplayName(metric: string): string {
    const names: Record<string, string> = {
      gpd: 'Ganho de Peso Diário',
      bcs: 'Escore de Condição Corporal',
      producao_leite: 'Produção de Leite',
      conversao_alimentar: 'Conversão Alimentar',
      mortalidade: 'Taxa de Mortalidade',
      biomassa_kg_ha: 'Biomassa da Pastagem',
      cobertura_pct: 'Cobertura do Solo'
    }
    return names[metric] || metric
  }
  
  private static getImpactDescription(metric: string, species: string): string {
    const impacts: Record<string, Record<string, string>> = {
      bovine: {
        gpd: 'Reduz o tempo até o abate e aumenta custos de alimentação',
        producao_leite: 'Diminui receita direta e pode indicar problemas nutricionais',
        bcs: 'Afeta reprodução e saúde geral do rebanho'
      },
      poultry: {
        conversao_alimentar: 'Aumenta custo de produção por kg de carne',
        mortalidade: 'Perda direta de animais e receita'
      },
      swine: {
        gpd: 'Aumenta dias até o abate e custos operacionais',
        conversao_alimentar: 'Eleva custo de ração por kg produzido'
      }
    }
    
    return impacts[species]?.[metric] || 'Impacta negativamente a produtividade'
  }
  
  private static categorizeMetric(metric: string): 'production' | 'health' | 'nutrition' | 'management' {
    const categories: Record<string, 'production' | 'health' | 'nutrition' | 'management'> = {
      gpd: 'production',
      producao_leite: 'production',
      mortalidade: 'health',
      bcs: 'health',
      conversao_alimentar: 'nutrition',
      biomassa_kg_ha: 'management',
      cobertura_pct: 'management'
    }
    return categories[metric] || 'production'
  }
}
```

### 5.2 Narrative Generation

```typescript
// lib/interpretation/narrative-generator.ts

export interface NarrativeSummary {
  overallStatus: 'excellent' | 'good' | 'attention' | 'critical'
  summaryText: string // "Sua produção está ruim em X, Y e Z, e ótima em A"
  goodMetrics: string[]
  badMetrics: string[]
  detailedInsights: string[]
}

export class NarrativeGenerator {
  /**
   * Generate plain-language summary
   */
  static generateSummary(
    metricSummaries: MetricSummary[],
    problems: ProblemArea[],
    species: string
  ): NarrativeSummary {
    const good = metricSummaries.filter(m => m.category === 'excellent')
    const bad = metricSummaries.filter(m => m.category === 'ruim')
    
    const overallStatus = this.determineOverallStatus(problems)
    
    // Generate summary sentence
    const summaryText = this.buildSummaryText(good, bad, species)
    
    // Generate detailed insights
    const detailedInsights = this.buildDetailedInsights(problems, species)
    
    return {
      overallStatus,
      summaryText,
      goodMetrics: good.map(m => ProblemIdentifier['getDisplayName'](m.metric_key)),
      badMetrics: bad.map(m => ProblemIdentifier['getDisplayName'](m.metric_key)),
      detailedInsights
    }
  }
  
  private static determineOverallStatus(
    problems: ProblemArea[]
  ): 'excellent' | 'good' | 'attention' | 'critical' {
    if (problems.length === 0) return 'excellent'
    
    const hasCritical = problems.some(p => p.severity === 'critical')
    if (hasCritical) return 'critical'
    
    const hasHigh = problems.some(p => p.severity === 'high')
    if (hasHigh || problems.length >= 3) return 'attention'
    
    return 'good'
  }
  
  private static buildSummaryText(
    good: MetricSummary[],
    bad: MetricSummary[],
    species: string
  ): string {
    const goodNames = good.map(m => ProblemIdentifier['getDisplayName'](m.metric_key))
    const badNames = bad.map(m => ProblemIdentifier['getDisplayName'](m.metric_key))
    
    if (bad.length === 0) {
      return `Excelente! Todos os indicadores estão dentro do esperado.`
    }
    
    if (good.length === 0) {
      return `Atenção necessária em: ${this.formatList(badNames)}.`
    }
    
    return `Sua produção está ${bad.length > good.length ? 'ruim' : 'com problemas'} em ${this.formatList(badNames)}, mas ótima em ${this.formatList(goodNames)}.`
  }
  
  private static formatList(items: string[]): string {
    if (items.length === 0) return ''
    if (items.length === 1) return items[0]
    if (items.length === 2) return `${items[0]} e ${items[1]}`
    
    const last = items[items.length - 1]
    const rest = items.slice(0, -1)
    return `${rest.join(', ')} e ${last}`
  }
  
  private static buildDetailedInsights(
    problems: ProblemArea[],
    species: string
  ): string[] {
    return problems.slice(0, 5).map(problem => {
      const direction = problem.deviation > 0 ? 'acima' : 'abaixo'
      const percentage = Math.abs(problem.deviation).toFixed(0)
      
      return `${problem.displayName} está ${percentage}% ${direction} do ideal. ${problem.impact}.`
    })
  }
}
```

---

## 6. Visual Representation System

### 6.1 Enhanced Silhouette Component

Currently, silhouettes show a single overall color. Enhancement: add visual indicators for specific problem areas.

```typescript
// components/layman/EnhancedAnimalSilhouette.tsx

export interface ProblemRegion {
  region: 'head' | 'body' | 'legs' | 'udder' | 'overall'
  severity: 'critical' | 'high' | 'medium' | 'low'
  metrics: string[]
}

interface EnhancedAnimalSilhouetteProps {
  species: 'bovine' | 'swine' | 'poultry' | 'sheep' | 'goat' | 'fish'
  overallColor: ColorCategory
  label: LabelCategory
  problemRegions?: ProblemRegion[]
  annotation?: Annotation
}

export function EnhancedAnimalSilhouette({
  species,
  overallColor,
  label,
  problemRegions = [],
  annotation
}: EnhancedAnimalSilhouetteProps) {
  // Render base silhouette with overall color
  // Add pulsing indicators on problem regions
  // Show tooltip on hover with specific issues
  
  return (
    <div className="relative">
      {/* Base silhouette */}
      <AnimalSilhouette
        species={species}
        color={overallColor}
        label={label}
        annotation={annotation}
      />
      
      {/* Problem region indicators */}
      {problemRegions.map((region, idx) => (
        <ProblemIndicator
          key={idx}
          region={region.region}
          severity={region.severity}
          metrics={region.metrics}
          species={species}
        />
      ))}
    </div>
  )
}

function ProblemIndicator({
  region,
  severity,
  metrics,
  species
}: {
  region: string
  severity: string
  metrics: string[]
  species: string
}) {
  // Position indicator based on region and species
  const position = getRegionPosition(region, species)
  const color = severity === 'critical' ? '#EF4444' : '#F59E0B'
  
  return (
    <div
      className="absolute animate-pulse"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: '20px',
        height: '20px'
      }}
      title={`Problemas: ${metrics.join(', ')}`}
    >
      <div
        className="w-full h-full rounded-full border-2 border-white"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

function getRegionPosition(
  region: string,
  species: string
): { x: number; y: number } {
  // Map regions to approximate positions on silhouette
  const positions: Record<string, Record<string, { x: number; y: number }>> = {
    bovine: {
      head: { x: 15, y: 30 },
      body: { x: 50, y: 40 },
      legs: { x: 50, y: 70 },
      udder: { x: 50, y: 60 }
    },
    // ... other species
  }
  
  return positions[species]?.[region] || { x: 50, y: 50 }
}
```

### 6.2 Top Issues Panel

```typescript
// components/layman/TopIssuesPanel.tsx

interface TopIssuesPanelProps {
  problems: ProblemArea[]
  species: string
}

export function TopIssuesPanel({ problems, species }: TopIssuesPanelProps) {
  const top3 = problems.slice(0, 3)
  
  if (top3.length === 0) {
    return (
      <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          <span className="font-medium text-green-800 dark:text-green-300">
            Nenhum problema identificado!
          </span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">
        Top 3 Problemas
      </h3>
      
      {top3.map((problem, idx) => (
        <div
          key={idx}
          className={`rounded-lg p-4 border-l-4 ${getSeverityStyles(problem.severity)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground">
                  {idx + 1}. {problem.displayName}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityBadge(problem.severity)}`}>
                  {problem.severity === 'critical' ? 'Crítico' : 
                   problem.severity === 'high' ? 'Alto' : 
                   problem.severity === 'medium' ? 'Médio' : 'Baixo'}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                Valor atual: <strong>{problem.currentValue.toFixed(2)}</strong>
                {' '}(ideal: {problem.targetRange.min.toFixed(1)} - {problem.targetRange.max.toFixed(1)})
              </p>
              
              <p className="text-sm text-foreground">
                {problem.impact}
              </p>
            </div>
            
            <AlertTriangle className={`h-5 w-5 ${getSeverityIconColor(problem.severity)}`} />
          </div>
        </div>
      ))}
    </div>
  )
}

function getSeverityStyles(severity: string): string {
  const styles = {
    critical: 'bg-red-50 dark:bg-red-950/30 border-red-500',
    high: 'bg-orange-50 dark:bg-orange-950/30 border-orange-500',
    medium: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500',
    low: 'bg-blue-50 dark:bg-blue-950/30 border-blue-500'
  }
  return styles[severity as keyof typeof styles] || styles.medium
}

function getSeverityBadge(severity: string): string {
  const badges = {
    critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }
  return badges[severity as keyof typeof badges] || badges.medium
}

function getSeverityIconColor(severity: string): string {
  const colors = {
    critical: 'text-red-600',
    high: 'text-orange-600',
    medium: 'text-yellow-600',
    low: 'text-blue-600'
  }
  return colors[severity as keyof typeof colors] || colors.medium
}
```

---

## 7. Action Plan Generation

### 7.1 Species Playbooks (Configuration-Driven)

```typescript
// lib/interpretation/action-playbooks.ts

export interface ActionItem {
  id: string
  title: string
  description: string
  priority: 'immediate' | 'high' | 'medium' | 'low'
  category: 'nutrition' | 'health' | 'management' | 'infrastructure'
  estimatedImpact: 'high' | 'medium' | 'low'
  timeframe: string // "1-2 semanas", "1 mês"
  dependencies?: string[] // IDs of actions that must be done first
  cost: 'low' | 'medium' | 'high'
  difficulty: 'easy' | 'moderate' | 'complex'
}

export interface ActionPlaybook {
  species: string
  subtype?: string
  triggers: {
    metric: string
    condition: 'below_minimum' | 'above_maximum' | 'below_ideal' | 'above_ideal'
    actions: ActionItem[]
  }[]
}

// Example playbook for bovine dairy
export const BOVINE_DAIRY_PLAYBOOK: ActionPlaybook = {
  species: 'bovine',
  subtype: 'dairy',
  triggers: [
    {
      metric: 'producao_leite',
      condition: 'below_minimum',
      actions: [
        {
          id: 'dairy_nutrition_01',
          title: 'Aumentar Proteína na Dieta',
          description: 'Elevar o teor de proteína bruta da dieta em 2 pontos percentuais, priorizando fontes de proteína degradável no rúmen.',
          priority: 'high',
          category: 'nutrition',
          estimatedImpact: 'high',
          timeframe: '1-2 semanas',
          cost: 'medium',
          difficulty: 'easy'
        },
        {
          id: 'dairy_nutrition_02',
          title: 'Verificar Qualidade da Silagem',
          description: 'Realizar análise bromatológica da silagem para verificar FDN, FDA e digestibilidade. Ajustar formulação se necessário.',
          priority: 'high',
          category: 'nutrition',
          estimatedImpact: 'high',
          timeframe: '3-5 dias',
          cost: 'low',
          difficulty: 'moderate'
        },
        {
          id: 'dairy_health_01',
          title: 'Verificar Saúde do Úbere',
          description: 'Realizar teste CMT (California Mastitis Test) em todas as vacas para detectar mastite subclínica.',
          priority: 'medium',
          category: 'health',
          estimatedImpact: 'medium',
          timeframe: '1 semana',
          dependencies: ['dairy_nutrition_01'],
          cost: 'low',
          difficulty: 'easy'
        }
      ]
    },
    {
      metric: 'bcs',
      condition: 'below_minimum',
      actions: [
        {
          id: 'dairy_nutrition_03',
          title: 'Aumentar Energia da Dieta',
          description: 'Adicionar fonte de energia concentrada (grãos, polpa cítrica) para melhorar condição corporal.',
          priority: 'high',
          category: 'nutrition',
          estimatedImpact: 'high',
          timeframe: '2-4 semanas',
          cost: 'medium',
          difficulty: 'easy'
        },
        {
          id: 'dairy_management_01',
          title: 'Separar Vacas por Condição Corporal',
          description: 'Criar lote específico para vacas com baixo ECC e fornecer dieta diferenciada.',
          priority: 'medium',
          category: 'management',
          estimatedImpact: 'medium',
          timeframe: '1 semana',
          cost: 'low',
          difficulty: 'moderate'
        }
      ]
    }
  ]
}

// Similar playbooks for other species...
export const POULTRY_BROILER_PLAYBOOK: ActionPlaybook = {
  species: 'poultry',
  subtype: 'broiler',
  triggers: [
    {
      metric: 'conversao_alimentar',
      condition: 'above_maximum',
      actions: [
        {
          id: 'broiler_nutrition_01',
          title: 'Revisar Formulação da Ração',
          description: 'Verificar energia metabolizável e perfil de aminoácidos da ração. Ajustar para atender exigências da fase.',
          priority: 'high',
          category: 'nutrition',
          estimatedImpact: 'high',
          timeframe: '3-5 dias',
          cost: 'medium',
          difficulty: 'moderate'
        },
        {
          id: 'broiler_management_01',
          title: 'Otimizar Programa de Luz',
          description: 'Ajustar fotoperíodo para estimular consumo de ração (23h luz / 1h escuro nas primeiras semanas).',
          priority: 'medium',
          category: 'management',
          estimatedImpact: 'medium',
          timeframe: '1 dia',
          cost: 'low',
          difficulty: 'easy'
        }
      ]
    },
    {
      metric: 'mortalidade',
      condition: 'above_maximum',
      actions: [
        {
          id: 'broiler_health_01',
          title: 'Revisar Programa Sanitário',
          description: 'Verificar calendário de vacinação e realizar necropsia para identificar causas de mortalidade.',
          priority: 'immediate',
          category: 'health',
          estimatedImpact: 'high',
          timeframe: '1-2 dias',
          cost: 'medium',
          difficulty: 'complex'
        },
        {
          id: 'broiler_management_02',
          title: 'Melhorar Ambiência',
          description: 'Verificar temperatura, umidade e ventilação. Ajustar para zona de conforto térmico da idade.',
          priority: 'immediate',
          category: 'management',
          estimatedImpact: 'high',
          timeframe: '1 dia',
          cost: 'low',
          difficulty: 'easy'
        }
      ]
    }
  ]
}
```

### 7.2 Action Plan Generator

```typescript
// lib/interpretation/action-plan-generator.ts

export interface ActionPlan {
  summary: string
  totalActions: number
  immediateActions: ActionItem[]
  shortTermActions: ActionItem[]
  mediumTermActions: ActionItem[]
  estimatedCost: 'low' | 'medium' | 'high'
  estimatedTimeframe: string
}

export class ActionPlanGenerator {
  /**
   * Generate prioritized action plan from problems
   */
  static generatePlan(
    problems: ProblemArea[],
    species: string,
    subtype?: string
  ): ActionPlan {
    // Load appropriate playbook
    const playbook = this.loadPlaybook(species, subtype)
    
    // Collect all applicable actions
    const allActions: ActionItem[] = []
    
    for (const problem of problems) {
      const trigger = playbook.triggers.find(t => t.metric === problem.metric)
      
      if (trigger) {
        // Determine condition
        const condition = problem.deviation < 0 ? 'below_minimum' : 'above_maximum'
        
        if (trigger.condition === condition) {
          allActions.push(...trigger.actions)
        }
      }
    }
    
    // Remove duplicates
    const uniqueActions = this.deduplicateActions(allActions)
    
    // Sort by priority and resolve dependencies
    const sortedActions = this.sortAndResolveDependencies(uniqueActions)
    
    // Group by timeframe
    const immediate = sortedActions.filter(a => a.priority === 'immediate')
    const shortTerm = sortedActions.filter(a => 
      a.priority === 'high' && a.priority !== 'immediate'
    )
    const mediumTerm = sortedActions.filter(a => 
      a.priority === 'medium' || a.priority === 'low'
    )
    
    // Estimate overall cost and timeframe
    const estimatedCost = this.estimateOverallCost(sortedActions)
    const estimatedTimeframe = this.estimateTimeframe(sortedActions)
    
    return {
      summary: this.generateSummary(problems.length, sortedActions.length),
      totalActions: sortedActions.length,
      immediateActions: immediate,
      shortTermActions: shortTerm,
      mediumTermActions: mediumTerm,
      estimatedCost,
      estimatedTimeframe
    }
  }
  
  private static loadPlaybook(species: string, subtype?: string): ActionPlaybook {
    // In production, load from database or JSON files
    // For now, return hardcoded playbooks
    const key = `${species}_${subtype || 'default'}`
    
    const playbooks: Record<string, ActionPlaybook> = {
      'bovine_dairy': BOVINE_DAIRY_PLAYBOOK,
      'poultry_broiler': POULTRY_BROILER_PLAYBOOK,
      // ... other playbooks
    }
    
    return playbooks[key] || { species, triggers: [] }
  }
  
  private static deduplicateActions(actions: ActionItem[]): ActionItem[] {
    const seen = new Set<string>()
    return actions.filter(action => {
      if (seen.has(action.id)) return false
      seen.add(action.id)
      return true
    })
  }
  
  private static sortAndResolveDependencies(actions: ActionItem[]): ActionItem[] {
    // Topological sort based on dependencies
    const sorted: ActionItem[] = []
    const visited = new Set<string>()
    
    const visit = (action: ActionItem) => {
      if (visited.has(action.id)) return
      
      // Visit dependencies first
      if (action.dependencies) {
        for (const depId of action.dependencies) {
          const dep = actions.find(a => a.id === depId)
          if (dep) visit(dep)
        }
      }
      
      visited.add(action.id)
      sorted.push(action)
    }
    
    // Sort by priority first
    const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3 }
    const prioritized = [...actions].sort((a, b) => 
      priorityOrder[a.priority] - priorityOrder[b.priority]
    )
    
    for (const action of prioritized) {
      visit(action)
    }
    
    return sorted
  }
  
  private static estimateOverallCost(actions: ActionItem[]): 'low' | 'medium' | 'high' {
    const costs = actions.map(a => a.cost)
    const highCount = costs.filter(c => c === 'high').length
    const mediumCount = costs.filter(c => c === 'medium').length
    
    if (highCount >= 2) return 'high'
    if (highCount >= 1 || mediumCount >= 3) return 'medium'
    return 'low'
  }
  
  private static estimateTimeframe(actions: ActionItem[]): string {
    // Parse timeframes and find the longest
    // Simplified: just return a range
    const hasImmediate = actions.some(a => a.priority === 'immediate')
    const hasLongTerm = actions.some(a => 
      a.timeframe.includes('mês') || a.timeframe.includes('semanas')
    )
    
    if (hasImmediate && hasLongTerm) return '1 dia a 1 mês'
    if (hasImmediate) return '1-7 dias'
    if (hasLongTerm) return '1-4 semanas'
    return '1-2 semanas'
  }
  
  private static generateSummary(problemCount: number, actionCount: number): string {
    if (problemCount === 0) {
      return 'Nenhuma ação necessária no momento. Continue monitorando.'
    }
    
    return `Identificamos ${problemCount} ${problemCount === 1 ? 'problema' : 'problemas'} que ${problemCount === 1 ? 'requer' : 'requerem'} ${actionCount} ${actionCount === 1 ? 'ação' : 'ações'} para correção.`
  }
}
```

### 7.3 Action Plan Panel Component

```typescript
// components/layman/ActionPlanPanel.tsx

interface ActionPlanPanelProps {
  actionPlan: ActionPlan
}

export function ActionPlanPanel({ actionPlan }: ActionPlanPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('immediate')
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Plano de Ação
        </h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{actionPlan.estimatedTimeframe}</span>
          <span className="mx-2">•</span>
          <DollarSign className="h-4 w-4" />
          <span className="capitalize">{actionPlan.estimatedCost}</span>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        {actionPlan.summary}
      </p>
      
      {/* Immediate Actions */}
      {actionPlan.immediateActions.length > 0 && (
        <ActionSection
          title="Ações Imediatas"
          subtitle="Requerem atenção urgente"
          actions={actionPlan.immediateActions}
          expanded={expandedSection === 'immediate'}
          onToggle={() => setExpandedSection(
            expandedSection === 'immediate' ? null : 'immediate'
          )}
          badgeColor="red"
        />
      )}
      
      {/* Short Term Actions */}
      {actionPlan.shortTermActions.length > 0 && (
        <ActionSection
          title="Ações de Curto Prazo"
          subtitle="Implementar nas próximas semanas"
          actions={actionPlan.shortTermActions}
          expanded={expandedSection === 'short'}
          onToggle={() => setExpandedSection(
            expandedSection === 'short' ? null : 'short'
          )}
          badgeColor="orange"
        />
      )}
      
      {/* Medium Term Actions */}
      {actionPlan.mediumTermActions.length > 0 && (
        <ActionSection
          title="Ações de Médio Prazo"
          subtitle="Planejar para o próximo mês"
          actions={actionPlan.mediumTermActions}
          expanded={expandedSection === 'medium'}
          onToggle={() => setExpandedSection(
            expandedSection === 'medium' ? null : 'medium'
          )}
          badgeColor="blue"
        />
      )}
    </div>
  )
}

interface ActionSectionProps {
  title: string
  subtitle: string
  actions: ActionItem[]
  expanded: boolean
  onToggle: () => void
  badgeColor: 'red' | 'orange' | 'blue'
}

function ActionSection({
  title,
  subtitle,
  actions,
  expanded,
  onToggle,
  badgeColor
}: ActionSectionProps) {
  const badgeStyles = {
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-card hover:bg-muted/50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeStyles[badgeColor]}`}>
            {actions.length}
          </span>
          <div className="text-left">
            <div className="font-semibold text-foreground">{title}</div>
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform ${
            expanded ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      
      {expanded && (
        <div className="p-4 space-y-3 bg-muted/20">
          {actions.map((action, idx) => (
            <ActionItemCard key={idx} action={action} index={idx} />
          ))}
        </div>
      )}
    </div>
  )
}

function ActionItemCard({ action, index }: { action: ActionItem; index: number }) {
  const categoryIcons = {
    nutrition: Utensils,
    health: Heart,
    management: Users,
    infrastructure: Building
  }
  
  const Icon = categoryIcons[action.category]
  
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-foreground">
              {index + 1}. {action.title}
            </h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              action.estimatedImpact === 'high' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : action.estimatedImpact === 'medium'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}>
              Impacto: {action.estimatedImpact === 'high' ? 'Alto' : 
                       action.estimatedImpact === 'medium' ? 'Médio' : 'Baixo'}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">
            {action.description}
          </p>
          
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              {action.timeframe}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              Custo: {action.cost === 'high' ? 'Alto' : action.cost === 'medium' ? 'Médio' : 'Baixo'}
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Wrench className="h-3 w-3" />
              {action.difficulty === 'complex' ? 'Complexo' : 
               action.difficulty === 'moderate' ? 'Moderado' : 'Fácil'}
            </span>
          </div>
          
          {action.dependencies && action.dependencies.length > 0 && (
            <div className="mt-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3 inline mr-1" />
              Requer conclusão de ações anteriores
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## 8. Fault Injection Layer

### 8.1 Purpose

The fault injection layer helps test the system's robustness by simulating various failure scenarios during development and testing. This is critical for identifying implementation problems before production.

### 8.2 Implementation

```typescript
// lib/layman/faults.ts

export type FaultType =
  | 'metric_mapping'      // Rename/swap metric keys
  | 'threshold_stale'     // Return old threshold version
  | 'threshold_missing'   // Omit metric thresholds
  | 'species_mismatch'    // Wrong species for silhouette
  | 'cache_stale'         // Return outdated cached data
  | 'auth_failure'        // Simulate 401 error
  | 'outlier_values'      // Inject extreme/NaN values
  | 'performance_delay'   // Add artificial delay
  | 'unit_mismatch'       // Wrong units (kg vs g)

export interface FaultConfig {
  enabled: boolean
  faults: {
    type: FaultType
    probability: number // 0-1
    params?: Record<string, unknown>
  }[]
}

export class FaultInjector {
  private static config: FaultConfig = {
    enabled: false,
    faults: []
  }
  
  /**
   * Initialize fault injection from environment or request header
   */
  static initialize(request?: Request): void {
    // Only enable in development/test
    if (process.env.NODE_ENV === 'production') {
      this.config.enabled = false
      return
    }
    
    // Check environment variable
    const envMode = process.env.LAYMAN_FAULT_MODE
    if (envMode) {
      this.config.enabled = true
      this.loadFaultsFromEnv(envMode)
      return
    }
    
    // Check request header
    if (request) {
      const header = request.headers.get('X-Debug-Faults')
      if (header) {
        this.config.enabled = true
        this.loadFaultsFromHeader(header)
      }
    }
  }
  
  /**
   * Inject metric mapping faults
   */
  static injectMetricMappingFault(
    metrics: Record<string, number>
  ): Record<string, number> {
    if (!this.shouldInjectFault('metric_mapping')) {
      return metrics
    }
    
    console.warn('[FAULT INJECTION] Injecting metric mapping fault')
    
    const faultyMetrics: Record<string, number> = {}
    
    for (const [key, value] of Object.entries(metrics)) {
      // Randomly rename keys
      if (Math.random() < 0.3) {
        const newKey = `FAULTY_${key.toUpperCase()}`
        faultyMetrics[newKey] = value
      } else if (Math.random() < 0.2) {
        // Swap units (kg -> g)
        faultyMetrics[key] = value * 1000
      } else {
        faultyMetrics[key] = value
      }
    }
    
    return faultyMetrics
  }
  
  /**
   * Inject threshold faults
   */
  static injectThresholdFault(
    thresholds: Record<string, unknown>
  ): Record<string, unknown> | null {
    if (!this.shouldInjectFault('threshold_missing')) {
      return thresholds
    }
    
    console.warn('[FAULT INJECTION] Injecting threshold fault')
    
    // Randomly remove some thresholds
    const faulty: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(thresholds)) {
      if (Math.random() > 0.3) {
        faulty[key] = value
      }
    }
    
    return Object.keys(faulty).length > 0 ? faulty : null
  }
  
  /**
   * Inject outlier values
   */
  static injectOutlierFault(value: number): number {
    if (!this.shouldInjectFault('outlier_values')) {
      return value
    }
    
    const faultType = Math.random()
    
    if (faultType < 0.3) {
      console.warn('[FAULT INJECTION] Injecting NaN value')
      return NaN
    } else if (faultType < 0.6) {
      console.warn('[FAULT INJECTION] Injecting negative value')
      return -Math.abs(value)
    } else {
      console.warn('[FAULT INJECTION] Injecting extreme value')
      return value * 1000
    }
  }
  
  /**
   * Inject performance delay
   */
  static async injectPerformanceDelay(): Promise<void> {
    if (!this.shouldInjectFault('performance_delay')) {
      return
    }
    
    const delay = 2000 + Math.random() * 3000 // 2-5 seconds
    console.warn(`[FAULT INJECTION] Injecting ${delay}ms delay`)
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  private static shouldInjectFault(type: FaultType): boolean {
    if (!this.config.enabled) return false
    
    const fault = this.config.faults.find(f => f.type === type)
    if (!fault) return false
    
    return Math.random() < fault.probability
  }
  
  private static loadFaultsFromEnv(mode: string): void {
    // Parse mode string: "metric_mapping:0.5,threshold_missing:0.3"
    const faults = mode.split(',').map(f => {
      const [type, prob] = f.split(':')
      return {
        type: type as FaultType,
        probability: parseFloat(prob) || 0.5
      }
    })
    
    this.config.faults = faults
  }
  
  private static loadFaultsFromHeader(header: string): void {
    this.loadFaultsFromEnv(header)
  }
}

// Usage in API routes:
// FaultInjector.initialize(request)
// const metrics = FaultInjector.injectMetricMappingFault(rawMetrics)
```

### 8.3 Fault Scenarios to Test

1. **Metric Mapping Faults**
   - Random key renaming
   - Unit swaps (kg ↔ g)
   - Missing required metrics
   - Negative values where positive expected

2. **Threshold Faults**
   - Stale threshold versions
   - Missing metric thresholds
   - Invalid threshold ranges

3. **Species Mismatch Faults**
   - Entity type doesn't map to silhouette
   - Subtype not found for species

4. **Cache Faults**
   - Stale annotation with different threshold version
   - Cache miss forcing recomputation

5. **Auth Faults**
   - 401 on first call, success on retry
   - Session expiration mid-request

6. **Data Quality Faults**
   - Outliers (>3 std dev)
   - Infinite/NaN values
   - Empty datasets

7. **Performance Faults**
   - Artificial delays (2-5s)
   - Timeout simulation

---

## 9. API Contracts

### 9.1 Enhanced Interpretation API

**Endpoint**: `POST /api/interpretation/enhanced`

**Request**:
```typescript
{
  analysisData: {
    numericStats: Record<string, NumericStats>
    categoricalStats?: Record<string, CategoricalStats>
    metadata?: {
      species: string
      subtype?: string
      totalRows: number
    }
  },
  species: string,
  subtype?: string,
  targetAudience?: 'producer' | 'researcher' | 'veterinarian',
  detailLevel?: 'basic' | 'medium' | 'detailed'
}
```

**Response**:
```typescript
{
  interpretation: {
    summary: NarrativeSummary,
    problems: ProblemArea[],
    actionPlan: ActionPlan,
    analogies: {
      metric: string
      analogy: string
    }[]
  },
  metadata: {
    species: string
    subtype?: string
    targetAudience: string
    detailLevel: string
    generatedAt: string
    thresholdsVersion: string
  }
}
```

### 9.2 Thresholds Management API

**Endpoint**: `GET /api/layman/thresholds?farmId={farmId}&species={species}&subtype={subtype}`

**Response**:
```typescript
{
  farm_id: string
  species: string
  subtype?: string
  version: string
  thresholds: ThresholdConfig[]
  updated_at: string
  source: 'farm_custom' | 'species_default' | 'global_default'
}
```

**Endpoint**: `PUT /api/layman/thresholds?farmId={farmId}`

**Request**:
```typescript
{
  thresholds: ThresholdConfig[]
  preview?: boolean // If true, validate but don't save
}
```

**Response**:
```typescript
{
  farm_id: string
  version: string
  applied: boolean
  preview: boolean
  errors: string[]
  warnings: string[]
}
```

### 9.3 Updated Evaluate API

**Endpoint**: `POST /api/layman/evaluate`

**Request**: (Same as current, but with normalized metrics)

**Response**: (Enhanced with problem identification)
```typescript
{
  entity_id: string
  final_color: 'red' | 'yellow' | 'green'
  short_label: 'ruim' | 'ok' | 'ótimo'
  annotation: Annotation
  metric_summaries: MetricSummary[]
  thresholds_version: string
  
  // NEW FIELDS
  problems: ProblemArea[]
  narrative: NarrativeSummary
  action_plan: ActionPlan
}
```

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Goals**: Fix critical bugs, implement normalization layer

**Tasks**:
1. ✅ Create metric normalization layer (`lib/layman/normalizer.ts`)
2. ✅ Fix meta_peso_kg bug in `services/layman.service.ts`
3. ✅ Update evaluate API to use normalizer
4. ✅ Add unit tests for normalizer
5. ✅ Document metric dictionary

**Deliverables**:
- Working normalization layer
- Fixed peso_vs_meta_pct calculation
- Test coverage >80%

### Phase 2: Interpretation Engine (Week 3-4)

**Goals**: Implement problem identification and narrative generation

**Tasks**:
1. ✅ Create `lib/interpretation/problem-identifier.ts`
2. ✅ Create `lib/interpretation/narrative-generator.ts`
3. ✅ Integrate with evaluate API
4. ✅ Add unit tests
5. ✅ Update LaymanTab to display summary

**Deliverables**:
- Problem identification working
- Plain-language summaries
- Top 3 issues panel in UI

### Phase 3: Action Plan System (Week 5-6)

**Goals**: Implement action plan generation

**Tasks**:
1. ✅ Create action playbooks for all species (`lib/interpretation/action-playbooks.ts`)
2. ✅ Create `lib/interpretation/action-plan-generator.ts`
3. ✅ Create `ActionPlanPanel` component
4. ✅ Integrate with interpretation API
5. ✅ Add unit tests

**Deliverables**:
- Action plan generation working
- Playbooks for 7 species
- Action plan UI component

### Phase 4: Threshold Management (Week 7-8)

**Goals**: Implement database-backed threshold management

**Tasks**:
1. ⏳ Create Prisma models for thresholds
2. ⏳ Implement `/api/layman/thresholds` endpoints
3. ⏳ Create threshold management UI (admin)
4. ⏳ Implement versioning and history
5. ⏳ Add caching layer

**Deliverables**:
- Threshold CRUD APIs
- Per-farm threshold customization
- Version history tracking

### Phase 5: Enhanced Visualization (Week 9-10)

**Goals**: Improve visual communication

**Tasks**:
1. ⏳ Enhance silhouettes with problem region indicators
2. ⏳ Add practical analogies
3. ⏳ Improve metric cards with trends
4. ⏳ Add comparative visualizations
5. ⏳ Polish UI/UX

**Deliverables**:
- Enhanced silhouette component
- Analogy generator
- Polished layman tab

### Phase 6: Testing & Fault Injection (Week 11-12)

**Goals**: Comprehensive testing and fault injection

**Tasks**:
1. ✅ Implement fault injection layer
2. ⏳ Create fault scenarios
3. ⏳ Integration tests with faults
4. ⏳ Performance testing
5. ⏳ User acceptance testing

**Deliverables**:
- Fault injection system
- Test coverage >85%
- Performance benchmarks

---

## 11. Testing Strategy

### 11.1 Unit Tests

**Normalization Layer**:
- Test canonical name mapping
- Test unit conversions
- Test derived metric calculation
- Test warning generation

**Interpretation Engine**:
- Test problem identification
- Test severity calculation
- Test narrative generation
- Test action plan generation

**Fault Injection**:
- Test each fault type
- Test fault probability
- Test graceful degradation

### 11.2 Integration Tests

**End-to-End Flow**:
1. Upload CSV with various metric names
2. Normalize metrics
3. Evaluate against thresholds
4. Generate interpretation
5. Display in UI

**Fault Scenarios**:
1. Missing metrics → graceful fallback
2. Stale thresholds → use defaults
3. Species mismatch → show error
4. Outlier values → flag in warnings

### 11.3 Performance Tests

**Benchmarks**:
- Normalization: <50ms for 100 metrics
- Evaluation: <100ms for 20 metrics
- Interpretation: <200ms
- Action plan generation: <100ms
- Total end-to-end: <500ms

**Load Tests**:
- 100 concurrent evaluations
- 1000 threshold lookups/sec
- Cache hit rate >90%

### 11.4 User Acceptance Tests

**Scenarios**:
1. Producer uploads bovine dairy data → sees clear problems and actions
2. Researcher uploads poultry data → sees technical details
3. Veterinarian reviews sheep health data → sees health-focused insights
4. Farm manager customizes thresholds → sees updated evaluations

---

## 12. Success Metrics

### 12.1 Technical Metrics

- **Accuracy**: >95% correct problem identification vs manual review
- **Performance**: <500ms end-to-end latency
- **Reliability**: <0.1% error rate
- **Test Coverage**: >85% code coverage
- **Cache Hit Rate**: >90% for threshold lookups

### 12.2 User Experience Metrics

- **Comprehension**: >90% of lay users understand summary without help
- **Actionability**: >80% of users can create action plan from interpretation
- **Time to Insight**: <30 seconds from upload to understanding problems
- **Satisfaction**: >4.5/5 user rating

### 12.3 Business Metrics

- **Adoption**: >60% of users use layman view
- **Engagement**: >50% of users view action plans
- **Retention**: >70% return within 7 days
- **Support Reduction**: <30% fewer "how to interpret" support tickets

---

## Appendix A: Metric Dictionary

### Bovine Metrics

| Canonical Name | Synonyms | Unit | Description |
|---|---|---|---|
| gpd | GPD, gmd_7d, gmd_30d, ganho_peso_diario | kg/dia | Daily weight gain |
| producao_leite | PRODUCAO_LEITE, milk_production, leite | L/dia | Milk production |
| bcs | BCS, escore_corporal, ESCORE_CORPORAL | - | Body condition score (1-5) |
| peso_kg | peso, PESO_ATUAL_KG, peso_atual_kg, weight | kg | Current weight |
| gordura | fat, fat_pct, teor_gordura | % | Milk fat percentage |
| proteina | protein, protein_pct, teor_proteina | % | Milk protein percentage |
| ccs | SCC, somatic_cell_count | células/mL | Somatic cell count |

### Poultry Metrics

| Canonical Name | Synonyms | Unit | Description |
|---|---|---|---|
| peso | weight, peso_vivo, live_weight | kg | Live weight |
| conversao_alimentar | FCR, fcr, feed_conversion, conversao | - | Feed conversion ratio |
| mortalidade | mortality, taxa_mortalidade, MORTALIDADE | % | Mortality rate |
| iep | IEP, production_efficiency_index | - | Production efficiency index |
| producao_ovos | egg_production, ovos, producao | % | Egg production rate |
| peso_ovo | egg_weight, peso_medio_ovo | g | Average egg weight |

### Swine Metrics

| Canonical Name | Synonyms | Unit | Description |
|---|---|---|---|
| gpd | daily_gain, ganho_diario, GPD | kg/dia | Daily weight gain |
| conversao_alimentar | FCR, fcr, conversao | - | Feed conversion ratio |
| espessura_toucinho | backfat, toucinho, backfat_thickness | mm | Backfat thickness |
| carne_magra | lean_meat, carne_magra_pct | % | Lean meat percentage |

### Forage Metrics

| Canonical Name | Synonyms | Unit | Description |
|---|---|---|---|
| biomassa_kg_ha | BIOMASSA_KG_HA, biomassa, biomass | kg/ha | Forage biomass |
| cobertura_pct | COBERTURA_PCT, cobertura, coverage | % | Ground coverage |
| indice_visual | INDICE_VISUAL, indice, visual_score | 0-100 | Visual quality index |
| proteina_bruta | crude_protein, PB, pb | % | Crude protein content |
| fdn | NDF, ndf, fibra_detergente_neutro | % | Neutral detergent fiber |

---

## Appendix B: Open Questions

1. **Meta Weight Source**: Where should meta_peso_kg come from?
   - Option A: Dataset metadata (requires user input during upload)
   - Option B: Project presets (farm-level defaults)
   - Option C: Species reference data (breed-specific targets)
   - **Recommendation**: Combination - use dataset metadata if available, fall back to project preset, then species reference

2. **Threshold Storage**: Database vs JSON files?
   - Option A: Database (Prisma models) - better for per-farm customization
   - Option B: JSON files - easier to version control and deploy
   - **Recommendation**: Database for farm-specific, JSON for defaults

3. **Species-Specific Body Regions**: Should we implement region highlighting?
   - Requires mapping metrics to body regions per species
   - Adds complexity to silhouette components
   - **Recommendation**: Phase 2 enhancement, not MVP

4. **AI Integration**: Should we use AI for narrative generation?
   - Hybrid approach: 80% rules, 20% AI
   - AI for analogies and creative explanations
   - **Recommendation**: Start with rules, add AI enhancement later

5. **Internationalization**: Support for multiple languages?
   - Currently Portuguese only
   - Would need to localize all narratives and action plans
   - **Recommendation**: Future enhancement, not MVP

---

## Appendix C: References

- [NRC Nutrient Requirements](https://www.nap.edu/topic/392/animal-nutrition)
- [EMBRAPA Publications](https://www.embrapa.br/publicacoes)
- [AgroInsight Multi-Species Architecture](./MULTI_SPECIES_ARCHITECTURE_PLAN.md)
- [Layman Visualization Feature Spec](./docs/FEATURE_VISUALIZACAO_LEIGA.md)
- [Pre.dev Specifications](./docs/pre.dev-spec.md)

---

**Document Version**: 1.0  
**Last Updated**: November 6, 2025  
**Author**: Devin AI  
**Status**: Ready for Implementation

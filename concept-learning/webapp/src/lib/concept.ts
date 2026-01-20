import conceptData from '@/data/concept-data.json'

// Types
export interface ElementExample {
  before?: string
  after?: string
  insight?: string
  solution?: string
  result?: string
}

export interface Element {
  name: string
  description: string
  examples?: ElementExample[]
  good?: string[]
  bad?: string[]
  points?: string[]
}

export interface Cost {
  type: string
  description: string
}

export interface ConditionExample {
  scenario?: string
  steps?: string[]
  product?: string
  barriers?: string[]
  solutions?: string[]
}

export interface Condition {
  number: number
  title: string
  point: string
  description: string
  costs?: Cost[]
  example?: ConditionExample
  tips?: string[]
  bad?: string[]
  checklist?: string[]
}

export interface Definition {
  id: string
  name: string
  description: string
  formula?: string
  elements?: Element[]
  source?: string
  conditions?: Condition[]
  usage: string
}

// New evaluation criteria types
export interface CriterionItem {
  id: number
  title: string
  description: string
}

export interface EvaluationCriteria {
  must: CriterionItem[]
  optional: CriterionItem[]
}

export interface EvaluationItem {
  match: '○' | '△' | '×'
  reason: string
}

export interface ConceptDetail {
  existing: string
  newPerspective: string
  insight: string
  tagline: string
}

export interface WhyGood {
  reframing: string
  insight: string
  simple: string
  action: string
}

export interface Example {
  slug: string
  title: string
  brand: string
  category: string
  concept: ConceptDetail
  whyGood: WhyGood
  namingIdeas: string[]
  learnings: string[]
  evaluation: Record<string, EvaluationItem>
}

export interface Category {
  name: string
  color: string
}

export interface ConceptData {
  definitions: Definition[]
  evaluationCriteria: EvaluationCriteria
  examples: Example[]
  categories: Record<string, Category>
}

const data = conceptData as ConceptData

// Definition functions
export function getAllDefinitions(): Definition[] {
  return data.definitions
}

export function getDefinitionById(id: string): Definition | undefined {
  return data.definitions.find(def => def.id === id)
}

export function getReframingDefinition(): Definition | undefined {
  return data.definitions.find(def => def.id === 'reframing')
}

export function getFiveConditionsDefinition(): Definition | undefined {
  return data.definitions.find(def => def.id === 'five-conditions')
}

// Evaluation Criteria functions
export function getEvaluationCriteria(): EvaluationCriteria {
  return data.evaluationCriteria
}

export function getMustCriteria(): CriterionItem[] {
  return data.evaluationCriteria.must
}

export function getOptionalCriteria(): CriterionItem[] {
  return data.evaluationCriteria.optional
}

export function getAllCriteria(): CriterionItem[] {
  return [...data.evaluationCriteria.must, ...data.evaluationCriteria.optional]
}

export function getCriterionById(id: number): CriterionItem | undefined {
  return getAllCriteria().find(c => c.id === id)
}

// Example functions
export function getAllExamples(): Example[] {
  return data.examples
}

export function getExampleBySlug(slug: string): Example | undefined {
  return data.examples.find(example => example.slug === slug)
}

export function getExamplesByCategory(category: string): Example[] {
  return data.examples.filter(example => example.category === category)
}

export function getAllSlugs(): string[] {
  return data.examples.map(example => example.slug)
}

// Category functions
export function getAllCategories(): Record<string, Category> {
  return data.categories
}

export function getCategoryInfo(categoryKey: string): Category | undefined {
  return data.categories[categoryKey]
}

// Utility functions
export function getCategoryColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    pink: 'bg-pink-100 text-pink-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
    green: 'bg-green-100 text-green-800',
    orange: 'bg-orange-100 text-orange-800'
  }
  return colorMap[color] || 'bg-gray-100 text-gray-800'
}

export function getMatchColorClass(match: '○' | '△' | '×'): string {
  const colorMap: Record<string, string> = {
    '○': 'text-green-600',
    '△': 'text-yellow-600',
    '×': 'text-red-600'
  }
  return colorMap[match] || 'text-gray-600'
}

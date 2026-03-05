// ============================================================
// Componente Sezione Score AI Data (FASE C - Split File Lunghi)
// ============================================================
// Estratto da athlete-ai-data-tab.tsx per migliorare manutenibilità
// ============================================================

'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Progress } from '@/components/ui'
import { TrendingUp, Target } from 'lucide-react'
import { sanitizeNumber } from '@/lib/sanitize'
import type { AthleteAIDataUpdate } from '@/types/athlete-profile'

interface AIDataScoresSectionProps {
  isEditing: boolean
  formData: AthleteAIDataUpdate
  aiData: {
    score_engagement: number | null
    score_progresso: number | null
  } | null
  onFormDataChange: (data: Partial<AthleteAIDataUpdate>) => void
}

export function AIDataScoresSection({
  isEditing,
  formData,
  aiData,
  onFormDataChange,
}: AIDataScoresSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background-secondary/40 backdrop-blur-xl shadow-[0_0_30px_rgba(2,179,191,0.08)] hover:shadow-[0_0_40px_rgba(2,179,191,0.15)] transition-all duration-300"
      >
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Score Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="score_engagement">Score (0-100)</Label>
                <span className="text-text-primary font-semibold">
                  {formData.score_engagement || 0}/100
                </span>
              </div>
              <Input
                id="score_engagement"
                type="range"
                min="0"
                max="100"
                value={formData.score_engagement || 0}
                onChange={(e) => {
                  const sanitized = sanitizeNumber(parseInt(e.target.value), 0, 100) || 0
                  onFormDataChange({ score_engagement: sanitized })
                }}
                className="w-full"
              />
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.score_engagement || ''}
                onChange={(e) => {
                  const sanitized = sanitizeNumber(
                    e.target.value ? parseInt(e.target.value) : null,
                    0,
                    100,
                  )
                  onFormDataChange({ score_engagement: sanitized })
                }}
                placeholder="0-100"
                className="w-full"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Score attuale</span>
                <span className="text-3xl font-bold text-primary drop-shadow-[0_0_12px_rgba(2,179,191,0.5)]">
                  {aiData?.score_engagement || 0}/100
                </span>
              </div>
              {aiData?.score_engagement && (
                <Progress value={aiData.score_engagement} className="h-3" />
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-background-secondary/40 backdrop-blur-xl shadow-[0_0_30px_rgba(2,179,191,0.08)] hover:shadow-[0_0_40px_rgba(2,179,191,0.15)] transition-all duration-300"
      >
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Score Progresso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="score_progresso">Score (0-100)</Label>
                <span className="text-text-primary font-semibold">
                  {formData.score_progresso || 0}/100
                </span>
              </div>
              <Input
                id="score_progresso"
                type="range"
                min="0"
                max="100"
                value={formData.score_progresso || 0}
                onChange={(e) => {
                  const sanitized = sanitizeNumber(parseInt(e.target.value), 0, 100) || 0
                  onFormDataChange({ score_progresso: sanitized })
                }}
                className="w-full"
              />
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.score_progresso || ''}
                onChange={(e) => {
                  const sanitized = sanitizeNumber(
                    e.target.value ? parseInt(e.target.value) : null,
                    0,
                    100,
                  )
                  onFormDataChange({ score_progresso: sanitized })
                }}
                placeholder="0-100"
                className="w-full"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Score attuale</span>
                <span className="text-3xl font-bold text-primary drop-shadow-[0_0_12px_rgba(2,179,191,0.5)]">
                  {aiData?.score_progresso || 0}/100
                </span>
              </div>
              {aiData?.score_progresso && (
                <Progress value={aiData.score_progresso} className="h-3" />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

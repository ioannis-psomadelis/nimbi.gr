'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { type ChartParamId, CHART_PARAMS } from '../../../lib/utils/runs'
import { getParamTranslations } from './types'

type ChartParam = (typeof CHART_PARAMS)[number]

interface ParamSelectorProps {
  selectedParam: ChartParamId
  onChange: (param: ChartParamId) => void
  availableParams: readonly ChartParam[]
}

export const ParamSelector = memo(function ParamSelector({
  selectedParam,
  onChange,
  availableParams,
}: ParamSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className="p-3 sm:p-4 border-b border-border overflow-x-auto">
      <div className="flex gap-1.5 sm:gap-2 min-w-max">
        {availableParams.map((param) => (
          <div key={param.id} className="flex items-stretch">
            <button
              onClick={() => onChange(param.id)}
              className={`
                px-3 sm:px-4 py-1.5 sm:py-2 rounded-l-lg text-xs sm:text-sm font-medium transition-all duration-200
                ${selectedParam === param.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted hover:bg-secondary text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <span className="hidden sm:inline">{t(getParamTranslations(param.id).label)}</span>
              <span className="sm:hidden">{t(getParamTranslations(param.id).short)}</span>
            </button>

            {/* Info Button with Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className={`
                    px-2 py-1.5 sm:py-2 rounded-r-lg text-xs transition-all duration-200 border-l
                    ${selectedParam === param.id
                      ? 'bg-primary text-primary-foreground/70 hover:text-primary-foreground border-primary-foreground/20'
                      : 'bg-muted hover:bg-secondary text-muted-foreground/60 hover:text-muted-foreground border-border'
                    }
                  `}
                  title={t('learnAbout') + ' ' + t(getParamTranslations(param.id).label)}
                >
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border shadow-xl sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3 text-foreground">
                    <span className="shrink-0 px-2.5 py-1.5 rounded-lg bg-primary/15 flex items-center justify-center">
                      <span className="text-primary font-semibold text-xs">{t(getParamTranslations(param.id).short)}</span>
                    </span>
                    <span className="text-lg">{t(getParamTranslations(param.id).label)}</span>
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-1">
                    {t(getParamTranslations(param.id).desc)}
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {t(getParamTranslations(param.id).info)}
                  </p>
                  <p className="text-sm text-foreground/90 leading-relaxed">
                    {t(getParamTranslations(param.id).usage)}
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </div>
  )
})

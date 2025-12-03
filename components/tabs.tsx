'use client'

import { ReactNode, useState, useEffect } from 'react'

interface Tab {
  id: string
  label: string
  icon?: ReactNode
  content: ReactNode
}

interface TabsProps {
  tabs: Tab[]
  defaultTab?: string
  activeTab?: string // NEW: controlled mode
  onTabChange?: (tabId: string) => void
}

export function Tabs({ tabs, defaultTab, activeTab: controlledActiveTab, onTabChange }: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id || '')

  // FIX: Sync internal state when switching from controlled to uncontrolled
  useEffect(() => {
    if (controlledActiveTab === undefined && defaultTab) {
      setInternalActiveTab(defaultTab)
    }
  }, [controlledActiveTab, defaultTab])

  // Use controlled tab if provided, otherwise use internal state
  const activeTab = controlledActiveTab ?? internalActiveTab

  const handleTabChange = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId)
    }
    onTabChange?.(tabId)
  }

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="border-b border-border bg-card">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-6 py-3 font-medium transition-all whitespace-nowrap
                border-b-2 hover:bg-muted/50
                ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-muted/30'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.map((tab) => (
          <div key={tab.id} className={activeTab === tab.id ? 'block' : 'hidden'}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}

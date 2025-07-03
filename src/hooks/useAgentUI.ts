'use client'

import { useState, useCallback } from 'react'

export interface AgentAction {
  type: string
  label: string
  style: string
  disabled?: boolean
}

export interface AgentComponentData {
  type: string
  data: Record<string, unknown>
  actions?: AgentAction[]
}

export function useAgentUI() {
  const [activeComponents, setActiveComponents] = useState<Map<string, AgentComponentData>>(new Map())
  const [loading, setLoading] = useState<Map<string, boolean>>(new Map())

  // Format currency for agent components
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }, [])

  // Format percentage for agent components
  const formatPercentage = useCallback((value: number): string => {
    return `${(value * 100).toFixed(1)}%`
  }, [])

  // Register a new agent component
  const registerComponent = useCallback((
    componentId: string, 
    componentData: AgentComponentData
  ) => {
    setActiveComponents(prev => new Map(prev.set(componentId, componentData)))
  }, [])

  // Update component data
  const updateComponent = useCallback((
    componentId: string, 
    updates: Partial<AgentComponentData>
  ) => {
    setActiveComponents(prev => {
      const current = prev.get(componentId)
      if (!current) return prev
      
      const updated = { ...current, ...updates }
      return new Map(prev.set(componentId, updated))
    })
  }, [])

  // Remove component
  const removeComponent = useCallback((componentId: string) => {
    setActiveComponents(prev => {
      const newMap = new Map(prev)
      newMap.delete(componentId)
      return newMap
    })
  }, [])

  // Set component loading state
  const setComponentLoading = useCallback((componentId: string, isLoading: boolean) => {
    setLoading(prev => new Map(prev.set(componentId, isLoading)))
  }, [])

  // Handle agent action execution
  const executeAction = useCallback(async (
    componentId: string, 
    actionType: string, 
    actionData?: Record<string, unknown>
  ): Promise<boolean> => {
    setComponentLoading(componentId, true)
    
    try {
      // TODO: Replace with actual agent action API calls
      const response = await fetch('/api/agents/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          componentId,
          actionType,
          actionData,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        
        // Update component with new data if provided
        if (result.componentData) {
          updateComponent(componentId, result.componentData)
        }
        
        return true
      } else {
        throw new Error('Action execution failed')
      }
    } catch (error) {
      console.error('Agent action error:', error)
      return false
    } finally {
      setComponentLoading(componentId, false)
    }
  }, [updateComponent, setComponentLoading])

  // Handle upgrade prompt actions
  const handleUpgradeAction = useCallback(async (actionType: string) => {
    if (actionType === 'upgrade') {
      // Redirect to settings for upgrade
      window.location.href = '/contractor/settings?tab=subscription'
    } else if (actionType === 'learn_more') {
      // Show upgrade benefits modal or page
      // TODO: Implement upgrade information display
      console.log('Show upgrade information')
    }
  }, [])

  // Generate component props for different agent types
  const getComponentProps = useCallback((
    componentId: string
  ): AgentComponentData | null => {
    return activeComponents.get(componentId) || null
  }, [activeComponents])

  // Check if component is loading
  const isComponentLoading = useCallback((componentId: string): boolean => {
    return loading.get(componentId) || false
  }, [loading])

  // Clear all components
  const clearAllComponents = useCallback(() => {
    setActiveComponents(new Map())
    setLoading(new Map())
  }, [])

  // Get component count by type
  const getComponentCountByType = useCallback((type: string): number => {
    return Array.from(activeComponents.values()).filter(
      component => component.type === type
    ).length
  }, [activeComponents])

  return {
    // State
    activeComponents,
    loading,
    
    // Actions
    registerComponent,
    updateComponent,
    removeComponent,
    executeAction,
    handleUpgradeAction,
    clearAllComponents,
    
    // Utilities
    formatCurrency,
    formatPercentage,
    getComponentProps,
    isComponentLoading,
    getComponentCountByType,
    setComponentLoading,
  }
}

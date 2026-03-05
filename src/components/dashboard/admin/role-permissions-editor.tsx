'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Label } from '@/components/ui/label'

interface PermissionCategory {
  category: string
  permissions: {
    key: string
    label: string
    description: string
  }[]
}

interface RolePermissionsEditorProps {
  permissions: Record<string, boolean>
  onChange: (permissions: Record<string, boolean>) => void
  categories: PermissionCategory[]
}

export function RolePermissionsEditor({
  permissions,
  onChange,
  categories,
}: RolePermissionsEditorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const togglePermission = (key: string) => {
    const newPermissions = { ...permissions }
    newPermissions[key] = !newPermissions[key]
    onChange(newPermissions)
  }

  const toggleAllInCategory = (category: PermissionCategory) => {
    const categoryPermissions = category.permissions.map((p) => p.key)
    const allEnabled = categoryPermissions.every((key) => permissions[key] === true)

    const newPermissions = { ...permissions }
    categoryPermissions.forEach((key) => {
      newPermissions[key] = !allEnabled
    })
    onChange(newPermissions)
  }

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {categories.map((category) => {
        const isExpanded = expandedCategories.has(category.category)
        const categoryPermissions = category.permissions.map((p) => p.key)
        const enabledCount = categoryPermissions.filter((key) => permissions[key] === true).length
        const allEnabled = categoryPermissions.every((key) => permissions[key] === true)

        return (
          <div
            key={category.category}
            className="border border-border rounded-lg p-3 bg-background"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleCategory(category.category)}
                className="flex items-center gap-2 text-white hover:text-primary transition-colors flex-1 text-left"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="font-medium">{category.category}</span>
                <span className="text-xs text-gray-400">
                  ({enabledCount}/{categoryPermissions.length})
                </span>
              </button>
              <button
                onClick={() => toggleAllInCategory(category)}
                className="text-xs text-primary hover:text-primary-hover transition-colors"
              >
                {allEnabled ? 'Deseleziona tutti' : 'Seleziona tutti'}
              </button>
            </div>

            {isExpanded && (
              <div className="mt-3 space-y-2 pl-6">
                {category.permissions.map((permission) => {
                  const isChecked = permissions[permission.key] === true

                  return (
                    <div
                      key={permission.key}
                      className="flex items-start gap-2 p-2 rounded hover:bg-background-tertiary/50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={permission.key}
                        checked={isChecked}
                        onChange={() => togglePermission(permission.key)}
                        className="mt-1 h-4 w-4 rounded border-border bg-background-secondary text-brand focus:ring-2 focus:ring-primary"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={permission.key}
                          className="text-sm text-white cursor-pointer font-medium"
                        >
                          {permission.label}
                        </Label>
                        <p className="text-xs text-gray-400 mt-0.5">{permission.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

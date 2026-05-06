export interface AppSetting {
  key: string
  value: string
  valueType: 'string' | 'number' | 'boolean' | 'json'
  updatedAt: string
}

export interface UiProfile {
  id: string
  name: string
  isActive: 0 | 1
  createdAt: string
  updatedAt: string
}

export interface UiToken {
  id: string
  profileId: string
  tokenPath: string
  value: string
  valueType: 'color' | 'px' | 'rem' | 'number' | 'font' | 'url' | 'string'
  updatedAt: string
}

export interface UiComponentOverride {
  id: string
  profileId: string
  componentKey: string
  propPath: string
  value: string
  valueType: 'color' | 'px' | 'rem' | 'number' | 'font' | 'url' | 'string'
  updatedAt: string
}

export interface UiElementDefinition {
  id: string
  profileId: string
  elementKey: string
  label: string
  description: string
  value: string
  defaultValue: string
  valueType: 'color' | 'px' | 'rem' | 'number' | 'font' | 'url' | 'string'
  category: 'text' | 'color' | 'background' | 'font' | 'border' | 'layout' | 'icon'
  updatedAt: string
}

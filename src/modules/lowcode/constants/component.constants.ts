// 组件类型枚举
export enum ComponentType {
  WEB = 'web',
  MOBILE = 'mobile'
}

// 组件类型选项
export const COMPONENT_TYPE_OPTIONS = [
  { label: 'Web端', value: ComponentType.WEB },
  { label: '移动端', value: ComponentType.MOBILE }
];

// 默认组件类型
export const DEFAULT_COMPONENT_TYPE = ComponentType.WEB; 
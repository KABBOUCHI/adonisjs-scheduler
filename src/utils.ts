export const arrayWrap = <T extends any>(value: T | T[]): T[] => {
  return Array.isArray(value) ? value : [value]
}

export function toggleInArray(items: string[], value: string, checked: boolean) {
  if (checked) return items.includes(value) ? items : [...items, value];
  return items.filter((item) => item !== value);
}

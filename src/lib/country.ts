export function countryNameFromCode(countryCode: string): string {
  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
  return displayNames.of(countryCode) ?? countryCode;
}

export class Formatter {
  static money(value: string, currency = ''): string {
    return `${currency}${value
      .replaceAll(',', '')
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}

export function cleanPhone(raw?: string | null): string {
  if (!raw) return '';
  const digits = raw.replace(/[^0-9]/g, '');

  // Belarus (+375)
  if (digits.startsWith('375') && digits.length === 12) return '+' + digits;
  if (digits.startsWith('80') && digits.length === 11) return '+375' + digits.slice(2);
  if (digits.startsWith('0') && digits.length === 10) return '+375' + digits.slice(1);

  // Russia (+7)
  if (digits.startsWith('7') && digits.length === 11) return '+' + digits;
  if (digits.startsWith('8') && digits.length === 11) return '+7' + digits.slice(1);

  return digits.length >= 9 ? '+' + digits : '';
}

export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskCpfDisplay(cpf?: string | null): string {
  if (!cpf) return '—';
  const digits = cpf.replace(/\D/g, '').padEnd(11, '•').slice(0, 11);
  return `${digits.slice(0, 3)}.***.***-${digits.slice(9, 11)}`;
}

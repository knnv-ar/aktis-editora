/** Valida un ISBN-13 (con o sin guiones) por su dígito de control. */
export function isbnValido(valor: string): boolean {
  const d = valor.replace(/[-\s]/g, '');
  if (!/^97[89]\d{10}$/.test(d)) return false;
  const suma = [...d.slice(0, 12)].reduce(
    (acc, c, i) => acc + Number(c) * (i % 2 === 0 ? 1 : 3),
    0,
  );
  return (10 - (suma % 10)) % 10 === Number(d[12]);
}

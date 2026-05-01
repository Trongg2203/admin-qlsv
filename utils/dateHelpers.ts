export function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addDays(date: string | Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function minusYear(date: string | Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() - years);
  return formatDate(d);
}

export const formatDate = (date) => {
  if (typeof date === "string") return date;
  if (!(date instanceof Date)) {
    throw new Error('Invalid date type. Expected Date, string, or number - got ' + date + '(' + typeof date + ')');
  }
  return date.toLocaleDateString('en-GB').replace(/\//g, '-');
}
export const parseDate = (dateString) => {
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    throw new Error('Invalid date format. Expected format: DD-MM-YYYY');
  }
  const [day, month, year] = parts.map(Number);
  return new Date(year, month - 1, day);
}
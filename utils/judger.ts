export function validateDecimalPlaces(numStr: string) {
  // Regular expression to check if the number has more than 9 decimal places
  const regex = /^\d+(\.\d{0,9})?$/;

  return regex.test(numStr);
}

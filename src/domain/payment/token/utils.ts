export function luhnValidator(number: string) {
  const cleanNumber = number.replace(/\D/g, "");
  let sum = 0;
  let shouldDouble = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function dateValidator(value: string) {
  const expirationDateRegex = /^(0[1-9]|1[0-2])\/(\d{4})$/;

  if (!expirationDateRegex.test(value))
    throw new Error("Formato de data inválido");

  const currentYear = new Date().getFullYear();
  const dataYear = Number(value.substring(3, 7));
  const dataMonth = Number(value.substring(0, 2));
  const currentMonth = new Date().getMonth() + 1;

  if (dataYear < currentYear) return false;

  if (currentYear === dataYear && dataMonth < currentMonth) return false;

  return true;
}

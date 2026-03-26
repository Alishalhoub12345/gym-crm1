export function getPasswordChecks(password: string) {
  return {
    hasUppercase: /[A-Z]/.test(password),
    hasDigit: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

export function isStrongPassword(password: string) {
  const checks = getPasswordChecks(password);
  return checks.hasUppercase && checks.hasDigit && checks.hasSpecial;
}

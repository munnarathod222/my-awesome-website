export const validatePassword = (password) => {
  const minLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strength = 0;
  if (minLength) strength++;
  if (hasUpper) strength++;
  if (hasLower) strength++;
  if (hasNumber) strength++;
  if (hasSpecial) strength++;

  return {
    isValid: minLength && hasUpper && hasLower && hasNumber && hasSpecial,
    strength,
    errors: {
      minLength: !minLength,
      hasUpper: !hasUpper,
      hasLower: !hasLower,
      hasNumber: !hasNumber,
      hasSpecial: !hasSpecial
    }
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
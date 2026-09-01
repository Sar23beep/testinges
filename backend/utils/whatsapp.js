function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

function whatsappUrl(number, name = '') {
  const digits = digitsOnly(number);
  if (digits.length < 8 || digits.length > 15) return null;
  const message = encodeURIComponent(`Hello${name ? ` ${name}` : ''}, I found your profile on Veloura.`);
  return `https://wa.me/${digits}?text=${message}`;
}

module.exports = { digitsOnly, whatsappUrl };

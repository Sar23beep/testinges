function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

const PRIMARY_WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER ? digitsOnly(process.env.WHATSAPP_NUMBER) : '916351615378';

function formatWhatsAppNumber(number) {
  let digits = digitsOnly(number);
  if (!digits || digits.length < 8) {
    digits = PRIMARY_WHATSAPP_NUMBER;
  }
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

function whatsappUrl(number, name = '') {
  const digits = formatWhatsAppNumber(number || PRIMARY_WHATSAPP_NUMBER);
  const message = encodeURIComponent(`Hello${name ? ` ${name}` : ''}, I found your profile on Sanjana Malhotra.`);
  return `https://wa.me/${digits}?text=${message}`;
}

function globalWhatsappUrl(customMessage = 'Hello, I want to inquire about verified profiles on Sanjana Malhotra.') {
  const digits = formatWhatsAppNumber(PRIMARY_WHATSAPP_NUMBER);
  return `https://wa.me/${digits}?text=${encodeURIComponent(customMessage)}`;
}

module.exports = { digitsOnly, formatWhatsAppNumber, whatsappUrl, globalWhatsappUrl, PRIMARY_WHATSAPP_NUMBER };

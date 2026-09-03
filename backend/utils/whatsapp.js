function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

const PRIMARY_WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER ? digitsOnly(process.env.WHATSAPP_NUMBER) : '916351615378';
const DEFAULT_CALL_NUMBER = process.env.CALL_NUMBER ? digitsOnly(process.env.CALL_NUMBER) : (process.env.WHATSAPP_NUMBER ? digitsOnly(process.env.WHATSAPP_NUMBER) : '6351615378');

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

function formatDisplayPhone(number) {
  let digits = digitsOnly(number);
  if (!digits) digits = DEFAULT_CALL_NUMBER;
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  return digits;
}

function whatsappUrl(number, name = '', customMessage = '') {
  const digits = formatWhatsAppNumber(number || PRIMARY_WHATSAPP_NUMBER);
  const message = customMessage || `Hello${name ? ` ${name}` : ''}, I found your profile on Sanjana Malhotra.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function cityWhatsappUrl(city, customMessage = '') {
  const number = city?.whatsapp || PRIMARY_WHATSAPP_NUMBER;
  const cityName = city?.name || 'India';
  const defaultMsg = `Hello, I want to inquire about verified call girls and escorts in ${cityName} on Sanjana Malhotra.`;
  return whatsappUrl(number, '', customMessage || defaultMsg);
}

function globalWhatsappUrl(customMessage = 'Hello, I want to inquire about verified profiles on Sanjana Malhotra.') {
  const digits = formatWhatsAppNumber(PRIMARY_WHATSAPP_NUMBER);
  return `https://wa.me/${digits}?text=${encodeURIComponent(customMessage)}`;
}

module.exports = {
  digitsOnly,
  formatWhatsAppNumber,
  formatDisplayPhone,
  whatsappUrl,
  cityWhatsappUrl,
  globalWhatsappUrl,
  PRIMARY_WHATSAPP_NUMBER,
  DEFAULT_CALL_NUMBER
};

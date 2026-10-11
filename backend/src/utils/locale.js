// ✅ Backend utility (CommonJS) — uses module.exports

// Convert any time string to 12-hour Ethiopian format
const to12Hour = (time) => {
  if (!time) return '';
  if (time.includes('AM') || time.includes('PM')) return time;
  const [hours, minutes] = time.split(':');
  let h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${minutes} ${ampm}`;
};

// Convert time string to minutes since midnight
const toMinutes = (timeStr) => {
  if (!timeStr) return 0;
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (hours === 12) hours = 0;
    if (modifier === 'PM') hours += 12;
    return hours * 60 + minutes;
  }
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Format currency as Ethiopian Birr
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('am-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2
  }).format(amount);
};

// Format date in Ethiopian format
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-ET', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Africa/Addis_Ababa'
  });
};

// Generate 30-minute time slots
const generateTimeSlots = (start = '12:00 AM', end = '11:30 PM', step = 30) => {
  const slots = [];
  const startMins = toMinutes(start);
  const endMins = toMinutes(end);
  for (let mins = startMins; mins <= endMins; mins += step) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 || 12;
    slots.push(`${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`);
  }
  return slots;
};

// ✅ CommonJS export (NOT `export`)
module.exports = {
  to12Hour,
  toMinutes,
  formatCurrency,
  formatDate,
  generateTimeSlots
};
function formatCountdown(targetIso) {
  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return null;
  const now = Date.now();
  const diff = Math.max(0, target - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, isPast: target <= now };
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function updateCountdown() {
  const target = document.body.dataset.nextShow;
  if (!target) return;
  const values = formatCountdown(target);
  if (!values) return;

  const map = {
    days: values.days,
    hours: values.hours,
    minutes: values.minutes,
    seconds: values.seconds,
  };

  Object.entries(map).forEach(([key, value]) => {
    const el = document.querySelector(`[data-count="${key}"]`);
    if (el) el.textContent = pad(value);
  });

  const label = document.querySelector('[data-countdown-status]');
  if (label) {
    label.textContent = values.isPast ? 'Showtime.' : 'Counting down to the next gig';
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

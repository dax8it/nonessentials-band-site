function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== '')) rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  if (cell.length || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim() !== '')) rows.push(row);
  }

  return rows;
}

function normalizeKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(normalizeKey);
  return rows.slice(1).map((values) => {
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = String(values[index] || '').trim();
    });
    return entry;
  });
}

function parseShowDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function isLiveStatus(value) {
  const status = String(value || '').trim().toLowerCase();
  return status === '' || status === 'live' || status === 'active' || status === 'upcoming';
}

function normalizeShow(row) {
  const startsAt = row.starts_at || row.start_at || row.date || row.datetime;
  const parsedDate = parseShowDate(startsAt);
  if (!parsedDate) return null;
  if (!isLiveStatus(row.status)) return null;

  return {
    startsAt: parsedDate,
    startsAtIso: parsedDate.toISOString(),
    displayDate: row.display_date || row.display || row.date_text || parsedDate.toLocaleString(),
    venue: row.venue || row.location || 'Venue TBA',
    address: row.address || row.city || 'Address TBA',
    notes: row.notes || '',
    ticketUrl: row.ticket_url || row.tickets || row.link || '',
  };
}

function splitShowsByTime(shows) {
  const now = Date.now();
  const sorted = shows
    .filter(Boolean)
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

  return {
    upcoming: sorted.filter((show) => show.startsAt.getTime() >= now),
    past: sorted.filter((show) => show.startsAt.getTime() < now).reverse(),
  };
}

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
    document.querySelectorAll(`[data-count="${key}"]`).forEach((el) => {
      el.textContent = pad(value);
    });
  });

  document.querySelectorAll('[data-countdown-status]').forEach((label) => {
    label.textContent = values.isPast ? 'Showtime.' : 'Counting down to the next gig';
  });
}

function updateTextTargets(selector, value) {
  document.querySelectorAll(selector).forEach((el) => {
    el.textContent = value;
  });
}

function renderShowsTable(shows) {
  const tbody = document.querySelector('[data-shows-table-body]');
  if (!tbody) return;

  if (!shows.length) {
    tbody.innerHTML = '<tr><td colspan="3">No upcoming shows right now. Check back soon.</td></tr>';
    return;
  }

  tbody.innerHTML = shows.map((show) => {
    const notes = show.notes ? `<div class="show-notes">${escapeHtml(show.notes)}</div>` : '';
    const ticket = show.ticketUrl ? `<div class="show-ticket"><a href="${escapeAttribute(show.ticketUrl)}" target="_blank" rel="noreferrer">Tickets / Info</a></div>` : '';
    return `
      <tr>
        <td><strong>${escapeHtml(show.displayDate)}</strong>${notes}${ticket}</td>
        <td>${escapeHtml(show.venue)}</td>
        <td>${escapeHtml(show.address)}</td>
      </tr>
    `;
  }).join('');
}

function renderPastShows(shows) {
  const container = document.querySelector('[data-past-shows-archive]');
  if (!container) return;

  if (!shows.length) {
    container.innerHTML = '<p class="small-note">No past shows archived yet.</p>';
    return;
  }

  container.innerHTML = shows.map((show) => `
    <article class="archive-item">
      <strong>${escapeHtml(show.displayDate)}</strong>
      <div class="archive-meta">${escapeHtml(show.venue)}</div>
      <div class="archive-meta">${escapeHtml(show.address)}</div>
    </article>
  `).join('');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value);
}

function syncTicketButtons(ticketUrl) {
  document.querySelectorAll('[data-next-show-ticket]').forEach((link) => {
    if (ticketUrl) {
      link.href = ticketUrl;
      link.classList.remove('is-hidden');
    } else {
      link.href = '#';
      link.classList.add('is-hidden');
    }
  });
}

function applyNextShow(show, allUpcomingShows, pastShows = []) {
  if (!show) {
    updateTextTargets('[data-next-show-venue]', 'No upcoming show booked yet');
    updateTextTargets('[data-next-show-display]', 'Dates coming soon');
    updateTextTargets('[data-next-show-address]', 'Check back for the next announcement.');
    syncTicketButtons('');
    renderShowsTable([]);
    renderPastShows(pastShows);
    return;
  }

  document.body.dataset.nextShow = show.startsAtIso;
  updateTextTargets('[data-next-show-venue]', show.venue);
  updateTextTargets('[data-next-show-display]', show.displayDate);
  updateTextTargets('[data-next-show-address]', show.address);
  syncTicketButtons(show.ticketUrl);
  renderShowsTable(allUpcomingShows);
  renderPastShows(pastShows);
  updateCountdown();
}

function setupArchiveToggle() {
  const button = document.querySelector('[data-archive-toggle]');
  const panel = document.querySelector('[data-past-shows-archive]');
  const icon = document.querySelector('.archive-toggle-icon');
  if (!button || !panel) return;

  const sync = () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    panel.classList.toggle('is-hidden', !expanded);
    if (icon) icon.textContent = expanded ? '−' : '+';
  };

  button.addEventListener('click', () => {
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    sync();
  });

  sync();
}

async function loadShowsFromSheet() {
  const csvUrl = document.body.dataset.showsCsv;
  if (!csvUrl) return;

  try {
    const response = await fetch(csvUrl, { mode: 'cors' });
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const text = await response.text();
    const rows = rowsToObjects(parseCsv(text));
    if (!rows.length) {
      return;
    }
    const normalizedShows = rows.map(normalizeShow).filter(Boolean);
    if (!normalizedShows.length) {
      return;
    }
    const { upcoming, past } = splitShowsByTime(normalizedShows);
    if (!upcoming.length) {
      applyNextShow(null, [], past);
      return;
    }
    applyNextShow(upcoming[0], upcoming, past);
  } catch (error) {
    console.warn('Could not load shows from Google Sheet; keeping fallback content.', error);
  }
}

setupArchiveToggle();
updateCountdown();
setInterval(updateCountdown, 1000);
loadShowsFromSheet();

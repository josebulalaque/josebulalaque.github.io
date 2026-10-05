// GitHub contribution calendar, fetched once at build time.
// github.com/users/<name>/contributions is the HTML fragment GitHub's own
// profile page loads; it needs no token. The deploy workflow rebuilds daily
// so the chart stays current.

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  level: number; // 0-4, GitHub's intensity bucket
  count: number;
}

export interface ContributionCalendar {
  days: ContributionDay[];
  total: number;
}

const attr = (tag: string, name: string) =>
  tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

export function parseContributions(html: string): ContributionCalendar {
  // Tooltips carry the counts ("3 contributions on May 2nd.") keyed by cell id.
  const counts = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip\b([^>]*)>([^<]*)<\/tool-tip>/g)) {
    const forId = attr(m[1], "for");
    const n = m[2].match(/^(\d[\d,]*)\s+contribution/);
    if (forId) counts.set(forId, n ? Number(n[1].replace(/,/g, "")) : 0);
  }

  const days: ContributionDay[] = [];
  for (const m of html.matchAll(/<td\b[^>]*ContributionCalendar-day[^>]*>/g)) {
    const date = attr(m[0], "data-date");
    if (!date) continue;
    const id = attr(m[0], "id") ?? "";
    days.push({
      date,
      level: Number(attr(m[0], "data-level") ?? 0),
      count: counts.get(id) ?? 0,
    });
  }

  days.sort((a, b) => a.date.localeCompare(b.date));
  return { days, total: days.reduce((sum, d) => sum + d.count, 0) };
}

export async function fetchContributions(username: string): Promise<ContributionCalendar | null> {
  try {
    const res = await fetch(`https://github.com/users/${username}/contributions`, {
      headers: { "User-Agent": "josebulalaque.github.io build" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const calendar = parseContributions(await res.text());
    if (calendar.days.length === 0) throw new Error("no contribution cells found");
    return calendar;
  } catch (err) {
    // Never fail the build over the chart; the component shows a fallback link.
    console.warn(`[contributions] could not load calendar for ${username}: ${err}`);
    return null;
  }
}

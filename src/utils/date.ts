const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;

export function formatRelativeTime(date: Date | string): string {
  if (!date) return '';

  const inputDate = typeof date === 'string' ? new Date(date) : date;

  // Return invalid date if the date is invalid
  if (isNaN(inputDate.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diff = now.getTime() - inputDate.getTime();

  // Handle future dates
  if (diff < 0) {
    return inputDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // Less than a minute
  if (diff < MINUTE) {
    const seconds = Math.floor(diff / SECOND);
    return seconds <= 1 ? 'just now' : `${seconds} secs ago`;
  }

  // Less than an hour
  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return minutes === 1 ? '1 min ago' : `${minutes} mins ago`;
  }

  // Less than a day
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return hours === 1 ? '1 hr ago' : `${hours} hrs ago`;
  }

  // Less than a week
  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return days === 1 ? 'yesterday' : `${days} days ago`;
  }

  // Less than a month
  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK);
    return weeks === 1 ? 'last week' : `${weeks} weeks ago`;
  }

  // If more than a month, return formatted date
  return inputDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: now.getFullYear() !== inputDate.getFullYear() ? 'numeric' : undefined,
  });
}

// Example usage:
// formatRelativeTime(new Date()) // "just now"
// formatRelativeTime("2024-01-07T10:30:00") // "Fri Jan 7"
// formatRelativeTime(new Date(Date.now() - 5000)) // "5 secs ago"
// formatRelativeTime(new Date(Date.now() - 45 * 1000)) // "45 secs ago"
// formatRelativeTime(new Date(Date.now() - 2 * 60 * 1000)) // "2 mins ago"
// formatRelativeTime(new Date(Date.now() - 3 * 60 * 60 * 1000)) // "3 hrs ago"
// formatRelativeTime(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)) // "2 days ago"
// formatRelativeTime(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // "1 week ago"

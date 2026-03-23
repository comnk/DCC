export function formatScheduled(scheduledTime: string): string {
  const date = new Date(scheduledTime);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
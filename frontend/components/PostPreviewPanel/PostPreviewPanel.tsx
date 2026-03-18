import { PostPreviewData } from "@/types/PostPreviewData";

type Props = {
  data?: PostPreviewData;
};

function formatScheduled(scheduledTime: string): string {
  const date = new Date(scheduledTime);
  return date.toLocaleString();
}

export default function PostPreviewPanel({ data }: Props) {
  const platforms = data?.platform ?? [];
  const hasAny = platforms.length > 0;
  const scheduled = data?.scheduled_time
    ? formatScheduled(data.scheduled_time)
    : null;
  const caption = data?.caption ?? "";
  const title = data?.title ?? "";
  return (
    <div>
      <h2>Post Preview</h2>
      {hasAny ? (
        <div>
          <h3>{title}</h3>
          <p>{caption}</p>
          <p>Scheduled: {scheduled}</p>
          <p>Platforms: {platforms.join(", ")}</p>
        </div>
      ) : (
        <p>No preview available.</p>
      )}
    </div>
  );
}

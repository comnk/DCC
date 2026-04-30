import { PostPreviewData } from "@/types/PostPreviewData";
import "./DiscordPreview.scss";
import Image from "next/image";
import { formatScheduled } from "@/utils/formatScheduled";

export default function DiscordPreview({ data }: { data: PostPreviewData }) {
  const images = data.media_asset ?? [];
  const count = images.length;

  return (
    <div className="dcCard">
      <div className="dcHeader">
        <div className="dcAvatar">U</div>
        <div>
          <span className="dcUsername">YourBot</span>
          <span className="dcBadge">APP</span>
          {data.scheduled_time && (
            <span className="dcTimestamp">
              {" "}
              - {formatScheduled(data.scheduled_time)}
            </span>
          )}
        </div>
      </div>

      {data.caption && <p className="dcCaption">{data.caption}</p>}

      {count > 0 ? (
        <div className={`dcImageGrid dcImageGrid--${Math.min(count, 4)}`}>
          {images.slice(0, 4).map((url, index) => (
            <div key={index} className="dcImageCell">
              {count > 4 && index === 3 ? (
                <div className="dcImageOverflow">
                  <Image
                    src={url}
                    alt={`Post image ${index + 1}`}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                  <div className="dcImageOverflowCount">+{count - 4}</div>
                </div>
              ) : (
                <Image
                  src={url}
                  alt={`Post image ${index + 1}`}
                  fill
                  loading="eager"
                  priority
                  sizes="(max-width: 768px) 100vw, 400px"
                  style={{ objectFit: "contain" }}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="dcImagePlaceholder">
          <span className="placeholderIcon">🖼</span>
          <span className="placeholderText">No image uploaded</span>
        </div>
      )}

      <div className="dcReactions">
        <span className="dcReactionChip">👍 1</span>
        <span className="dcReactionChip">❤️ 1</span>
      </div>
    </div>
  );
}

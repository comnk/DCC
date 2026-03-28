import { PostPreviewData } from "@/types/PostPreviewData";
import "./DiscordPreview.scss";
import Image from "next/image";
import { formatScheduled } from "@/utils/formatScheduled";

export default function DiscordPreview({ data }: { data: PostPreviewData }) {
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

      <div className="dcImageWrap">
        {data.media_asset && data.media_asset.length > 0 ? (
          data.media_asset.map((url, index) => (
            <div
              key={index}
              style={{ position: "relative", width: "100%", height: "100%" }}
            >
              <Image
                src={url}
                alt={`Post image ${index + 1}`}
                fill
                style={{ objectFit: "cover", borderRadius: 4 }}
              />
            </div>
          ))
        ) : (
          <div className="dcImagePlaceholder">
            <span className="placeholderIcon">🖼</span>
            <span className="placeholderText">No image uploaded</span>
          </div>
        )}
      </div>

      <div className="dcReactions">
        <span className="dcReactionChip">👍 1</span>
        <span className="dcReactionChip">❤️ 1</span>
      </div>
    </div>
  );
}

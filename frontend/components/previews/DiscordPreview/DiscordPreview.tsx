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
        {data.photo_url ? (
          <Image
            src={data.photo_url}
            alt="Post"
            fill
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
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

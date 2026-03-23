import "./LinkedInPreview.scss";

import { PostPreviewData } from "@/types/PostPreviewData";
import { formatScheduled } from "@/utils/formatScheduled";
import Image from "next/image";

export default function LinkedInPreview({ data }: { data: PostPreviewData }) {
  return (
    <div className="liCard">
      <div className="liHeader">
        <div className="liAvatar">U</div>
        <div>
          <p className="liName">Your Name</p>
          <p className="liMeta">Your Title • 1st</p>
          {data.scheduled_time && (
            <p className="liMeta">
              {formatScheduled(data.scheduled_time)} • 🌐
            </p>
          )}
        </div>
        <span className="liMore">⋯</span>
      </div>

      {data.caption && <p className="liCaption">{data.caption}</p>}

      <div className="liImageWrap">
        {data.photo_url ? (
          <Image
            src={data.photo_url}
            alt="Post"
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="imagePlaceholder">
            <span className="placeholderIcon">🖼</span>
            <span className="placeholderText">No image uploaded</span>
          </div>
        )}
      </div>

      <div className="liReactions">
        <span>👍 Like</span>
        <span>💬 Comment</span>
        <span>🔁 Repost</span>
        <span>📤 Send</span>
      </div>
    </div>
  );
}

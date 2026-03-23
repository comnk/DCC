import Image from "next/image";
import "./InstagramPreview.scss";

import { PostPreviewData } from "@/types/PostPreviewData";
import { formatScheduled } from "@/utils/formatScheduled";

export default function InstagramPreview({ data }: { data: PostPreviewData }) {
  return (
    <div className="igCard">
      <div className="igHeader">
        <div className="igAvatar">
          <span>U</span>
        </div>
        <div>
          <p className="igUsername">your_account</p>
          <p className="igSponsored">Sponsored</p>
        </div>
        <span className="igMore">⋯</span>
      </div>

      <div className="igImageWrap">
        {data.photo_url ? (
          <Image
            src={data.photo_url}
            alt="Post"
            fill
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="igImagePlaceholder">
            <span className="igPlaceholderIcon">🖼</span>
            <span className="igPlaceholderText">No image uploaded</span>
          </div>
        )}
      </div>

      <div className="igActions">
        <span className="igActionIcon">🤍</span>
        <span className="igActionIcon">💬</span>
        <span className="igActionIcon">📤</span>
        <span className="igBookmark">🔖</span>
      </div>

      <div className="igBody">
        {data.caption && (
          <p className="igCaption">
            <strong>your_account</strong> {data.caption}
          </p>
        )}
        {data.scheduled_time && (
          <p className="igDate">{formatScheduled(data.scheduled_time)}</p>
        )}
      </div>
    </div>
  );
}

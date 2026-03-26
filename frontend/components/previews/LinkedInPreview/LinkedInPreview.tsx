import "./LinkedInPreview.scss";

import { PostPreviewData } from "@/types/PostPreviewData";
import { formatScheduled } from "@/utils/formatScheduled";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function LinkedInPreview({ data }: { data: PostPreviewData }) {
  const hasImages = data.photo_urls && data.photo_urls.length > 0;

  return (
    <div className="liCard">
      <div className="liHeader">
        <div className="liAvatar">U</div>
        <div className="liHeaderText">
          <p className="liName">Your Name</p>
          <p className="liMeta">Your Title • 1st</p>
          {data.scheduled_time && (
            <p className="liMeta">
              {formatScheduled(data.scheduled_time)} • 🌐
            </p>
          )}
        </div>
        <div className="liHeaderActions">
          <button className="liFollowBtn">+ Follow</button>
          <span className="liMore">⋯</span>
        </div>
      </div>

      {data.caption && <p className="liCaption">{data.caption}</p>}

      <div className="liImageWrap">
        {hasImages ? (
          <Swiper
            modules={[Pagination, Navigation]}
            pagination={{ clickable: true }}
            navigation={data.photo_urls!.length > 1}
            slidesPerView={1}
            className="liSwiper"
          >
            {data.photo_urls!.map((url, index) => (
              <SwiperSlide key={index}>
                <div className="liSlide">
                  <Image
                    src={url}
                    alt={`Post image ${index + 1}`}
                    fill
                    sizes={
                      "(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                    }
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="liImagePlaceholder">
            <span className="liPlaceholderIcon">🖼</span>
            <span className="liPlaceholderText">No image uploaded</span>
          </div>
        )}
      </div>

      <div className="liReactionBar">
        <div className="liReactionIcons">
          <span>👍</span>
          <span>🙌</span>
          <span>❤️</span>
          <p className="liReactionCount">247 reactions • 38 comments</p>
        </div>
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

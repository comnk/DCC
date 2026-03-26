import Image from "next/image";
import "./InstagramPreview.scss";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
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
        {data.photo_urls && data.photo_urls.length > 0 ? (
          <Swiper
            spaceBetween={50}
            slidesPerView={1}
            onSlideChange={() => console.log("slide change")}
            onSwiper={(swiper) => console.log(swiper)}
          >
            {data.photo_urls.map((url, index) => (
              <SwiperSlide key={index}>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    paddingTop: "100%",
                  }}
                >
                  <Image
                    src={url}
                    alt={`Post image ${index + 1}`}
                    fill
                    sizes={
                      "(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                    }
                    style={{ objectFit: "cover", borderRadius: 4 }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
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

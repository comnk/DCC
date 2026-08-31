"use client";

type DiscordFieldsValue = {
  discord_location: string;
  discord_event_start: string;
  discord_event_end: string;
};

export default function DiscordFields({
  value,
  onChange,
}: {
  value: DiscordFieldsValue;
  onChange: (updates: Partial<DiscordFieldsValue>) => void;
}) {
  return (
    <>
      <div className="post-form__field">
        <label className="post-form__label" htmlFor="discord_location">
          Event Location
        </label>
        <input
          className="post-form__input"
          type="text"
          id="discord_location"
          placeholder="e.g. DIB 208, Zoom, Online"
          onChange={(e) => onChange({ discord_location: e.target.value })}
          value={value.discord_location}
        />
      </div>
      <div className="post-form__field">
        <label className="post-form__label" htmlFor="discord_event_start">
          Event Start Time
        </label>
        <input
          className="post-form__input"
          type="datetime-local"
          id="discord_event_start"
          onChange={(e) => onChange({ discord_event_start: e.target.value })}
          value={value.discord_event_start}
        />
      </div>
      <div className="post-form__field">
        <label className="post-form__label" htmlFor="discord_event_end">
          Event End Time
        </label>
        <input
          className="post-form__input"
          type="datetime-local"
          id="discord_event_end"
          onChange={(e) => onChange({ discord_event_end: e.target.value })}
          value={value.discord_event_end}
        />
      </div>
    </>
  );
}

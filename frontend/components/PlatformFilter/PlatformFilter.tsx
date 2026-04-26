"use client";

const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "discord", label: "Discord" },
];

interface Props {
  value: string | null;
  onChange: (platform: string | null) => void;
}

export default function PlatformFilter({ value, onChange }: Props) {
  return (
    <select
      className="posts-page__platform-filter"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
    >
      <option value="">All Platforms</option>
      {PLATFORMS.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

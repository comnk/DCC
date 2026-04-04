import "./CampaignSearchBar.scss";

interface CampaignSearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function CampaignSearchBar({
  searchTerm,
  setSearchTerm,
}: CampaignSearchBarProps) {
  return (
    <div className="campaign-search-bar">
      <input
        type="text"
        placeholder="Search campaigns..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}

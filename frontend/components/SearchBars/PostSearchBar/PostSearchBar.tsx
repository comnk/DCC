import "./PostSearchBar.scss";

interface PostSearchBarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

export default function PostSearchBar({
  searchTerm,
  setSearchTerm,
}: PostSearchBarProps) {
  return (
    <div className="post-search-bar">
      <input
        type="text"
        placeholder="Search posts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}

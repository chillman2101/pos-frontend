import { Search } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";

const SearchBar = ({ onSearch, placeholder = "Cari produk..." }) => {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        icon={<Search className="w-5 h-5" />}
      />
    </div>
  );
};

export default SearchBar;

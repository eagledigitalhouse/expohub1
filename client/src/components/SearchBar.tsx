import { ChangeEvent, useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (term: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className="relative mb-6 w-full max-w-md mx-auto lg:mx-0">
      <div className="relative flex items-center">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Buscar recursos..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full bg-dark-surface border border-dark-border rounded-full py-2.5 pl-10 pr-10 text-white placeholder-gray-500 focus:ring-2 ring-primary/30 focus:border-primary transition-all duration-200"
        />
        {searchTerm && (
          <button 
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
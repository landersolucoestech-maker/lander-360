import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FilterOption {
  key: string;
  label: string;
  options: string[];
}

interface SearchFilterProps {
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onSearch: (searchTerm: string) => void;
  onFilter: (filters: Record<string, string>) => void;
  onClear: () => void;
}

export const SearchFilter = ({
  searchPlaceholder = "Buscar...",
  filters = [],
  onSearch,
  onFilter,
  onClear
}: SearchFilterProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters };
    if (value === "all" || value === "") {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setActiveFilters(newFilters);
    onFilter(newFilters);
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setActiveFilters({});
    onSearch("");
    onFilter({});
    onClear();
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="flex flex-row gap-2 items-center w-full">
      {/* Search Input - Takes remaining space */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Selects - Always visible when filters exist */}
      {filters.length > 0 && (
        <>
          {filters.map((filter) => (
            <div key={filter.key} className="shrink-0 w-40">
              <Select
                value={activeFilters[filter.key] || "all"}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos {filter.label}</SelectItem>
                  {filter.options.map((option, index) => (
                    <SelectItem key={`${filter.key}-${option}-${index}`} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </>
      )}

      {/* Active Filters Badges - Inline */}
      {activeFilterCount > 0 && (
        <div className="flex gap-1 shrink-0 max-w-xs overflow-x-auto">
          {Object.entries(activeFilters).map(([key, value]) => {
            const filter = filters.find(f => f.key === key);
            return (
              <Badge key={key} variant="secondary" className="gap-1 text-xs whitespace-nowrap">
                {filter?.label}: {value}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => handleFilterChange(key, "")}
                />
              </Badge>
            );
          })}
        </div>
      )}

      {/* Clear Filters Button */}
      {(searchTerm || activeFilterCount > 0) && (
        <Button
          variant="ghost"
          onClick={clearAllFilters}
          className="gap-2 shrink-0 whitespace-nowrap"
          size="default"
        >
          <X className="h-4 w-4" />
          Limpar
        </Button>
      )}
    </div>
  );
};
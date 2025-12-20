import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MUSIC_GENRES } from "@/lib/constants";

interface GenreSelectProps {
  value: string | null | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const GenreSelect = ({ 
  value, 
  onChange, 
  placeholder = "Selecione o gênero",
  disabled = false,
  className 
}: GenreSelectProps) => {
  return (
    <Select 
      value={value || undefined} 
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {MUSIC_GENRES.map((genre) => (
          <SelectItem key={genre.value} value={genre.value}>
            {genre.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

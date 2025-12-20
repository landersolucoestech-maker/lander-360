import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useArtists } from '@/hooks/useArtists';
import { cn } from '@/lib/utils';

interface ArtistAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function ArtistAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Digite para buscar...",
  className 
}: ArtistAutocompleteProps) {
  const { data: artists = [] } = useArtists();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal value with external value
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Filter artists based on input
  const filteredArtists = artists.filter(artist => {
    const searchTerm = inputValue.toLowerCase();
    const name = artist.name?.toLowerCase() || '';
    const stageName = artist.stage_name?.toLowerCase() || '';
    const fullName = artist.full_name?.toLowerCase() || '';
    
    return (
      name.includes(searchTerm) || 
      stageName.includes(searchTerm) || 
      fullName.includes(searchTerm)
    );
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectArtist = (artistName: string) => {
    setInputValue(artistName);
    onChange(artistName);
    setIsOpen(false);
  };

  const handleFocus = () => {
    if (inputValue.length > 0 || filteredArtists.length > 0) {
      setIsOpen(true);
    }
  };

  // Retorna o nome real (full_name ou legal_name) como prioridade para cadastro
  const getRealName = (artist: any) => {
    return artist.full_name || artist.legal_name || artist.name;
  };

  // Nome para exibição no dropdown: Nome Real (Nome Artístico)
  const getDisplayName = (artist: any) => {
    const realName = artist.full_name || artist.legal_name;
    const artisticName = artist.stage_name || artist.name;
    
    if (realName && realName !== artisticName) {
      return `${realName} (${artisticName})`;
    }
    return realName || artisticName;
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Input
        ref={inputRef}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoComplete="off"
      />
      
      {isOpen && filteredArtists.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredArtists.slice(0, 10).map((artist) => (
            <button
              key={artist.id}
              type="button"
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground transition-colors"
              onClick={() => handleSelectArtist(getRealName(artist))}
            >
              <div className="font-medium">{getRealName(artist)}</div>
              {(artist.stage_name || artist.name) && getRealName(artist) !== (artist.stage_name || artist.name) && (
                <div className="text-xs text-muted-foreground">Nome artístico: {artist.stage_name || artist.name}</div>
              )}
              {artist.genre && (
                <div className="text-xs text-muted-foreground">{artist.genre}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

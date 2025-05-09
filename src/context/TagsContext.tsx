import React, { createContext, useContext, useState, ReactNode } from 'react';

export type TagType = {
  raw: string;
  epc: string;
  scannedAt: number;
};

type TagsContextType = {
  tags: TagType[];
  setTags: (tags: TagType[]) => void;
  addTags: (newTags: TagType[]) => void;
};

const TagsContext = createContext<TagsContextType | undefined>(undefined);

export const TagsProvider = ({ children }: { children: ReactNode }) => {
  const [tags, setTagsState] = useState<TagType[]>([]);

  const setTags = (newTags: TagType[]) => {
    setTagsState(newTags);
  };

  const addTags = (newTags: TagType[]) => {
    setTagsState(prev => {
      const existingHex = new Set(prev.map(t => t.epc));
      const filtered = newTags.filter(tag => !existingHex.has(tag.epc));
      return [...prev, ...filtered];
    });
  };

  return (
    <TagsContext.Provider value={{ tags, setTags, addTags }}>
      {children}
    </TagsContext.Provider>
  );
};

export const useTags = (): TagsContextType => {
  const context = useContext(TagsContext);
  if (!context) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
};

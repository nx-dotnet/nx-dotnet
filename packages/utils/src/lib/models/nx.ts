export type ModuleBoundary = {
  sourceTag?: '*' | string;
  allSourceTags?: string[];
  onlyDependOnLibsWithTags?: string[];
  notDependOnLibsWithTags?: string[];
};

export type ModuleBoundaries = ModuleBoundary[];

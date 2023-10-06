export type ModuleBoundaries = {
  sourceTag?: '*' | string;
  allSourceTags?: string[];
  onlyDependOnLibsWithTags?: string[];
  notDependOnLibsWithTags?: string[];
}[];

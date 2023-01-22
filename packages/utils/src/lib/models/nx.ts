export type ModuleBoundaries = {
  sourceTag: '*' | string;
  onlyDependOnLibsWithTags?: string[];
  notDependOnLibsWithTags?: string[];
}[];

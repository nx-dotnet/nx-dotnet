export function getTypeNameFromReference(ref: string) {
  return ref?.replace(/(#\/components\/schemas\/|#\/definitions\/\/)/, '');
}

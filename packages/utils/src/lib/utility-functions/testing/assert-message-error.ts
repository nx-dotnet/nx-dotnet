export function assertErrorMessage(e: unknown): e is { message: string } {
  if (typeof e === 'object' && 'message' in (e || {})) {
    return true;
  }
  return false;
}

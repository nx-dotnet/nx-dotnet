import { deepMerge } from './config';

describe('deepMerge', () => {
  it('should merge two objects', () => {
    const base = { a: 1, b: 2 };
    const next = { b: 3, c: 4 };
    const result = deepMerge(base, next);
    expect(result).toEqual({ a: 1, b: 3, c: 4 });
  });
});

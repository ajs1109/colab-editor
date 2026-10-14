import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from './utils';

describe('safeRedirectPath', () => {
  it('allows same-origin relative paths', () => {
    expect(safeRedirectPath('/a/b')).toBe('/a/b');
  });

  it.each([null, undefined, '', 'https://x', '//evil.com', '/\\evil.com'])('rejects %j', (next) => {
    expect(safeRedirectPath(next)).toBe('/projects');
  });

  it('uses the given fallback', () => {
    expect(safeRedirectPath('//evil.com', '/home')).toBe('/home');
  });
});

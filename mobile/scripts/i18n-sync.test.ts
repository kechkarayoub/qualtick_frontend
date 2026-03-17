import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { mergeMissing, syncLocales } from './i18n-sync';

describe('i18n-sync.ts', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  it('mergeMissing adds missing keys and fills empty strings without overwriting non-empty', () => {
    const source = {
      auth: {
        title: 'Sign in',
        subtitle: 'Welcome',
        nested: { a: 'A' },
      },
    };

    const target: any = {
      auth: {
        title: 'Connexion',
        subtitle: '',
        nested: {},
      },
    };

    const changed = mergeMissing(source, target);

    expect(changed).toBe(true);
    expect(target).toEqual({
      auth: {
        title: 'Connexion',
        subtitle: 'Welcome',
        nested: { a: 'A' },
      },
    });
  });

  it('syncLocales creates missing locale files and merges EN keys', () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'i18n-sync-test-'));
    const locales = path.join(tempRoot, 'locales');
    const enDir = path.join(locales, 'en');
    const frDir = path.join(locales, 'fr');
    const arDir = path.join(locales, 'ar');

    fs.mkdirSync(enDir, { recursive: true });
    fs.mkdirSync(frDir, { recursive: true });
    fs.mkdirSync(arDir, { recursive: true });

    const fileName = 'common.json';
    fs.writeFileSync(
      path.join(enDir, fileName),
      JSON.stringify({
        common: {
          ok: 'OK',
          cancel: 'Cancel',
          nested: { hello: 'Hello' },
        },
      }),
      'utf8'
    );

    fs.writeFileSync(
      path.join(frDir, fileName),
      JSON.stringify({ common: { ok: 'D\'accord', cancel: '' } }),
      'utf8'
    );

    const changes = syncLocales(locales);

    expect(changes).toBeGreaterThan(0);

    const frResult = JSON.parse(fs.readFileSync(path.join(frDir, fileName), 'utf8'));
    const arResult = JSON.parse(fs.readFileSync(path.join(arDir, fileName), 'utf8'));

    expect(frResult.common.ok).toBe('D\'accord');
    expect(frResult.common.cancel).toBe('Cancel');
    expect(frResult.common.nested.hello).toBe('Hello');

    expect(arResult.common.ok).toBe('OK');
    expect(arResult.common.cancel).toBe('Cancel');
    expect(arResult.common.nested.hello).toBe('Hello');
    expect(logSpy).toHaveBeenCalled();
  });
});

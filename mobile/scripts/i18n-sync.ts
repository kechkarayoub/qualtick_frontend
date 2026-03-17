import fs from 'node:fs';
import path from 'node:path';

function mergeMissing(source: Record<string, any>, target: Record<string, any>): boolean {
  let changed = false;
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (tgtVal === undefined) {
      target[key] = srcVal;
      changed = true;
    } else if (
      srcVal && typeof srcVal === 'object' && !Array.isArray(srcVal) &&
      tgtVal && typeof tgtVal === 'object' && !Array.isArray(tgtVal)
    ) {
      if (mergeMissing(srcVal, tgtVal)) changed = true;
    } else if (typeof tgtVal === 'string' && tgtVal.trim() === '') {
      target[key] = srcVal;
      changed = true;
    }
  }
  return changed;
}

function loadJson(file: string): Record<string, any> {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveJson(file: string, data: Record<string, any>): void {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function syncLocales(localesRootDir: string = path.resolve(__dirname, '../src/i18n/locales')): number {
  const localesDir = localesRootDir;
  const enDir = path.join(localesDir, 'en');
  const frDir = path.join(localesDir, 'fr');
  const arDir = path.join(localesDir, 'ar');

  const files = fs.readdirSync(enDir).filter((f) => f.endsWith('.json'));

  let totalChanges = 0;
  for (const file of files) {
    const enFile = path.join(enDir, file);
    const frFile = path.join(frDir, file);
    const arFile = path.join(arDir, file);

    if (!fs.existsSync(frFile)) fs.writeFileSync(frFile, '{}', 'utf8');
    if (!fs.existsSync(arFile)) fs.writeFileSync(arFile, '{}', 'utf8');

    const enJson = loadJson(enFile);
    const frJson = loadJson(frFile);
    const arJson = loadJson(arFile);

    const frChanged = mergeMissing(enJson, frJson);
    const arChanged = mergeMissing(enJson, arJson);

    if (frChanged) {
      saveJson(frFile, frJson);
      console.log(`[i18n-sync] Updated FR ${file}`);
      totalChanges++;
    }
    if (arChanged) {
      saveJson(arFile, arJson);
      console.log(`[i18n-sync] Updated AR ${file}`);
      totalChanges++;
    }
  }

  if (totalChanges === 0) {
    console.log('[i18n-sync] All locale files are in sync with EN.');
  } else {
    console.log(`[i18n-sync] Completed with ${totalChanges} file(s) updated.`);
  }

  return totalChanges;
}

export { mergeMissing, loadJson, saveJson, syncLocales };

if (typeof require !== 'undefined' && require.main === module) {
  syncLocales();
}

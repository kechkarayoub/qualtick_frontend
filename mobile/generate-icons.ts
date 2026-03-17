#!/usr/bin/env node

/**
 * Icon Generator Script for React Native
 * This script converts SVG logo to various app icon sizes
 * Usage: tsx generate-icons.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const androidSizes: Record<string, number> = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const iosSizes: Record<string, number> = {
  '20x20': 20,
  '29x29': 29,
  '40x40': 40,
  '58x58': 58,
  '60x60': 60,
  '80x80': 80,
  '87x87': 87,
  '120x120': 120,
  '180x180': 180,
  '1024x1024': 1024,
};

async function generateIcons(): Promise<void> {
  const logoPath = path.join(__dirname, 'assets', 'logo.svg');

  if (!fs.existsSync(logoPath)) {
    console.log('❌ Logo file not found at assets/logo.svg');
    return;
  }

  console.log('🎨 Generating app icons...');

  try {
    console.log('📱 Generating Android icons...');
    for (const [folder, size] of Object.entries(androidSizes)) {
      const outputDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', folder);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      await sharp(logoPath)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, 'ic_launcher.png'));

      await sharp(logoPath)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, 'ic_launcher_round.png'));

      console.log(`  ✅ Generated ${folder}/ic_launcher.png (${size}x${size})`);
    }

    console.log('🍎 Generating iOS icons...');
    const iosIconDir = path.join(__dirname, 'ios', 'qualitick', 'Images.xcassets', 'AppIcon.appiconset');

    if (!fs.existsSync(iosIconDir)) {
      fs.mkdirSync(iosIconDir, { recursive: true });
    }

    for (const [name, size] of Object.entries(iosSizes)) {
      await sharp(logoPath)
        .resize(size, size)
        .png()
        .toFile(path.join(iosIconDir, `Icon-${name}.png`));

      console.log(`  ✅ Generated iOS Icon-${name}.png (${size}x${size})`);
    }

    const contentsJson = {
      images: [
        { idiom: 'iphone', scale: '2x', size: '20x20', filename: 'Icon-40x40.png' },
        { idiom: 'iphone', scale: '3x', size: '20x20', filename: 'Icon-60x60.png' },
        { idiom: 'iphone', scale: '2x', size: '29x29', filename: 'Icon-58x58.png' },
        { idiom: 'iphone', scale: '3x', size: '29x29', filename: 'Icon-87x87.png' },
        { idiom: 'iphone', scale: '2x', size: '40x40', filename: 'Icon-80x80.png' },
        { idiom: 'iphone', scale: '3x', size: '40x40', filename: 'Icon-120x120.png' },
        { idiom: 'iphone', scale: '2x', size: '60x60', filename: 'Icon-120x120.png' },
        { idiom: 'iphone', scale: '3x', size: '60x60', filename: 'Icon-180x180.png' },
        { idiom: 'ios-marketing', scale: '1x', size: '1024x1024', filename: 'Icon-1024x1024.png' },
      ],
      info: { version: 1, author: 'xcode' },
    };

    fs.writeFileSync(
      path.join(iosIconDir, 'Contents.json'),
      JSON.stringify(contentsJson, null, 2)
    );

    console.log('  ✅ Generated Contents.json for iOS');
    console.log('\n🎉 All icons generated successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Clean and rebuild your app');
    console.log('   2. Run: npx react-native run-android');
    console.log('   3. Run: npx react-native run-ios');
  } catch (error: any) {
    console.error('❌ Error generating icons:', error?.message || error);
  }
}

generateIcons();

export default generateIcons;

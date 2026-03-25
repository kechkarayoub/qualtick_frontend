/**
 * scripts/generate-sw.js
 *
 * Injects Firebase config env vars into public/firebase-messaging-sw.js
 * before the dev server starts or before a production build.
 *
 * Called automatically via the prestart / prebuild npm lifecycle hooks.
 */

const fs = require('fs');
const path = require('path');

const SW_TEMPLATE = path.join(__dirname, '..', 'public', 'firebase-messaging-sw.js');

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_WEB_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_WEB_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_WEB_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_WEB_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_WEB_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_WEB_APP_ID || '',
};

let content = fs.readFileSync(SW_TEMPLATE, 'utf8');
content = content.replace(
  '__FIREBASE_CONFIG__',
  JSON.stringify(firebaseConfig),
);

fs.writeFileSync(SW_TEMPLATE, content, 'utf8');

console.log('[generate-sw] firebase-messaging-sw.js updated with env vars.');

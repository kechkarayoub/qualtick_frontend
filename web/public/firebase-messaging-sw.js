/* eslint-disable no-restricted-globals */
/* eslint-env serviceworker */
/* global importScripts, firebase, {"apiKey":"","authDomain":"","projectId":"","storageBucket":"","messagingSenderId":"","appId":""} */
/**
 * Firebase Cloud Messaging Service Worker
 *
 * Handles background push notifications when the browser tab is not in focus.
 * Firebase config is injected at build/start time by scripts/generate-sw.js.
 * Do not edit the {"apiKey":"","authDomain":"","projectId":"","storageBucket":"","messagingSenderId":"","appId":""} placeholder — it is replaced automatically.
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// {"apiKey":"","authDomain":"","projectId":"","storageBucket":"","messagingSenderId":"","appId":""} is replaced by scripts/generate-sw.js with the real JSON.
const firebaseConfig = {"apiKey":"","authDomain":"","projectId":"","storageBucket":"","messagingSenderId":"","appId":""};

firebase.initializeApp(firebaseConfig);

const firebaseMessaging = firebase.messaging();

firebaseMessaging.onBackgroundMessage((payload) => {
  const { title = 'Qualitick', body = '' } = payload.notification || {};
  self.registration.showNotification(title, {
    body,
    icon: '/logo192.png',
    data: payload.data,
  });
});

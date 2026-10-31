import { registerSW } from 'virtual:pwa-register';

export function registerPwaServiceWorker() {
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        if (window.confirm('New version of StudyPlan available. Reload to update?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        console.log('StudyPlan is ready for full offline use!');
      }
    });
  }
}
import { Asset } from 'expo-asset';
import { Image } from 'react-native';
import { Audio } from 'expo-av';
import profileService from '../services/profileService';

/** Loaded during splash — keep this list small for a fast startup */
const CRITICAL_IMAGE_ASSETS = [
  require('../../assets/cosmic-nail-nobg.webp'),
  require('../../assets/new-flame-icon.webp'),
  require('../../assets/trophy-icon.webp'),
  require('../../assets/cool-orb.webp'),
];

/** Loaded in the background after the home screen appears */
const DEFERRED_IMAGE_ASSETS = [
  require('../../assets/mountain-scene-background.webp'),
  require('../../assets/library-sound-icons/rain-icon.webp'),
  require('../../assets/library-sound-icons/new-sea-icon.webp'),
  require('../../assets/library-sound-icons/new-campfire-icon.webp'),
  require('../../assets/library-sound-icons/white-noise-icon.webp'),
  require('../../assets/relaxation-sounds/campfire-image.jpg'),
  require('../../assets/relaxation-sounds/rain-image.jpg'),
  require('../../assets/recovery-page-icons/increased-confidence.webp'),
  require('../../assets/recovery-page-icons/healthy-nails.webp'),
  require('../../assets/recovery-page-icons/new-meditation-icon.webp'),
  require('../../assets/recovery-page-icons/better-hygiene-icon.webp'),
  require('../../assets/recovery-page-icons/willpower-icon.webp'),
  require('../../assets/bigger-achievement-icons/Sprout-280px.png'),
  require('../../assets/bigger-achievement-icons/Da-Oak-280px.png'),
  require('../../assets/bigger-achievement-icons/Landmark-280px.png'),
  require('../../assets/bigger-achievement-icons/Sun-280px.png'),
  require('../../assets/bigger-achievement-icons/Deeply-Rooted-280px.png'),
  require('../../assets/bigger-achievement-icons/Blossom-280px.png'),
  require('../../assets/cooler-trophy-icon.webp'),
  require('../../assets/see-images-page/bacteria.webp'),
  require('../../assets/see-images-page/damaged-enamel-icon.webp'),
  require('../../assets/see-images-page/anxiety-loop.webp'),
  require('../../assets/onboarding-icons/Nayl-cooler-logo.webp'),
  require('../../assets/onboarding-icons/progress-icon-duotone.png'),
  require('../../assets/onboarding-icons/diary-icon-duotone.png'),
  require('../../assets/onboarding-icons/panic-button-icon-duotone.png'),
];

const AUDIO_ASSETS = [
  require('../../assets/relaxation-sounds/campfire-sounds-short.mp3'),
  require('../../assets/relaxation-sounds/short-rain-sounds.mp3'),
  require('../../assets/relaxation-sounds/ocean-waves.mp3'),
  require('../../assets/relaxation-sounds/white-noise.mp3'),
];

const VIDEO_ASSETS = [
  require('../../assets/meditation-nayl-video.mp4'),
];

let deferredPreloadStarted = false;

export async function preloadCriticalAssets(): Promise<void> {
  await Asset.loadAsync(CRITICAL_IMAGE_ASSETS);
}

async function prefetchImageUris(assets: number[]): Promise<void> {
  await Promise.all(
    assets.map((asset) => {
      const { uri } = Image.resolveAssetSource(asset);
      return uri ? Image.prefetch(uri).catch(() => undefined) : Promise.resolve();
    }),
  );
}

async function preloadDeferredImages(): Promise<void> {
  await Asset.loadAsync(DEFERRED_IMAGE_ASSETS);
  await prefetchImageUris(DEFERRED_IMAGE_ASSETS);
}

async function preloadAudio(): Promise<void> {
  await Promise.all(
    AUDIO_ASSETS.map(async (asset) => {
      try {
        const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: false });
        await sound.unloadAsync();
      } catch {
        // Non-critical
      }
    }),
  );
}

async function preloadVideos(): Promise<void> {
  try {
    await Asset.loadAsync(VIDEO_ASSETS);
  } catch {
    // Video asset may be missing in some environments
  }
}

async function preloadRemoteProfilePicture(): Promise<void> {
  try {
    const cached = await profileService.getCachedProfileData();
    if (cached?.profile_picture_url) {
      await Image.prefetch(cached.profile_picture_url).catch(() => undefined);
    }
    const profile = await profileService.getProfileData();
    if (profile.profile_picture_url) {
      await Image.prefetch(profile.profile_picture_url).catch(() => undefined);
    }
  } catch {
    // Offline or unavailable
  }
}

/** Fire-and-forget — call once after home screen mounts */
export function preloadDeferredAssets(): void {
  if (deferredPreloadStarted) return;
  deferredPreloadStarted = true;

  Promise.all([
    preloadDeferredImages(),
    preloadAudio(),
    preloadVideos(),
    preloadRemoteProfilePicture(),
  ]).catch(() => undefined);
}

/** @deprecated Use preloadCriticalAssets + preloadDeferredAssets */
export async function preloadAppAssets(): Promise<void> {
  await preloadCriticalAssets();
  preloadDeferredAssets();
}

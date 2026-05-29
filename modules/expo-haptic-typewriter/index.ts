import ExpoHapticTypewriterModule from './src/ExpoHapticTypewriterModule';

export async function startTypewriterHaptics(characterCount: number, speed: number): Promise<void> {
  return await ExpoHapticTypewriterModule.startTypewriterHaptics(characterCount, speed);
}

export function stopTypewriterHaptics(): void {
  return ExpoHapticTypewriterModule.stopTypewriterHaptics();
}

export function tickCharacter(): void {
  return ExpoHapticTypewriterModule.tickCharacter();
}

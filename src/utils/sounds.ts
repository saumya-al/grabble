// Sound utility functions

let tileDropSound: HTMLAudioElement | null = null;

export const initSounds = () => {
  // Initialize audio elements
  // Use absolute path from public directory
  const soundPath = process.env.PUBLIC_URL 
    ? `${process.env.PUBLIC_URL}/sounds/poker-chip-dropping-80329.mp3`
    : '/sounds/poker-chip-dropping-80329.mp3';
  
  tileDropSound = new Audio(soundPath);
  tileDropSound.preload = 'auto';
  tileDropSound.volume = 0.5; // Set volume to 50%
  
  // Log for debugging
  console.log('Sound initialized from:', soundPath);
};

export const playTileDropSound = (soundEnabled: boolean) => {
  if (!soundEnabled) {
    console.log('Sound disabled, skipping');
    return;
  }
  
  if (!tileDropSound) {
    console.warn('Tile drop sound not initialized');
    return;
  }
  
  try {
    // Reset to start and play
    tileDropSound.currentTime = 0;
    const playPromise = tileDropSound.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Tile drop sound played successfully');
        })
        .catch(error => {
          console.warn('Could not play tile drop sound:', error);
          // Try to initialize again if it failed
          if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
            console.log('Audio play was blocked or not supported');
          }
        });
    }
  } catch (error) {
    console.warn('Error playing tile drop sound:', error);
  }
};


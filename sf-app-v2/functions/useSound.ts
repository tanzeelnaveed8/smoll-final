import { Audio } from "expo-av";
import { useEffect, useRef } from "react";

// Define a type for the available sound types
type SoundType = "message" | "messageReceived";

// Create a mapping of sound types to their file paths
const soundFiles: Record<SoundType, any> = {
  message: require("@/assets/audio/message.mp3"),
  messageReceived: require("@/assets/audio/message-received.mp3"),
};

export const useSound = () => {
  // Change to store multiple sounds
  const soundsRef = useRef<Record<SoundType, Audio.Sound | null>>({
    message: null,
    messageReceived: null,
  });

  useEffect(() => {
    loadSounds();
    return () => {
      unloadSounds();
    };
  }, []);

  // Load all sounds
  const loadSounds = async () => {
    try {
      for (const [type, file] of Object.entries(soundFiles)) {
        const { sound } = await Audio.Sound.createAsync(file);
        soundsRef.current[type as SoundType] = sound;
      }
    } catch (error) {
      console.error("Error loading sounds", error);
    }
  };

  // Unload all sounds
  const unloadSounds = async () => {
    for (const sound of Object.values(soundsRef.current)) {
      if (sound) {
        await sound.unloadAsync();
      }
    }
  };

  // Play a specific sound type
  const play = async (type: SoundType, volume: number = 0.4) => {
    const sound = soundsRef.current[type];

    if (sound) {
      try {
        await sound.replayAsync({
          volume,
        });
      } catch (error) {
        console.error(`Error playing ${type} sound`, error);
      }
    }
  };

  return {
    play,
  };
};

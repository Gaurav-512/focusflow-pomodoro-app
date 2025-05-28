
"use client";

let audioContext: AudioContext | null = null;
let alarmOscillator: OscillatorNode | null = null;
let alarmGainNode: GainNode | null = null;
let alarmInterval: NodeJS.Timeout | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window !== 'undefined') {
    if (audioContext && audioContext.state === 'running') {
      return audioContext;
    }
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
        return audioContext;
      }
    } catch (e) {
      console.error("Failed to create AudioContext:", e);
    }
  }
  console.warn("Web Audio API is not supported or context could not be created.");
  return null;
};


export const playSoundEffect = (isMuted: boolean) => {
  if (isMuted) return;
  const localAudioContext = getAudioContext();
  if (!localAudioContext) return;

  try {
    const oscillator = localAudioContext.createOscillator();
    const gainNode = localAudioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, localAudioContext.currentTime); // A4 note

    gainNode.gain.setValueAtTime(0.0001, localAudioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, localAudioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.00001, localAudioContext.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(localAudioContext.destination);

    oscillator.start(localAudioContext.currentTime);
    oscillator.stop(localAudioContext.currentTime + 0.5);
  } catch (error) {
    console.error("Failed to play sound effect:", error);
  }
};

export const playAlarmSound = (isMuted: boolean) => {
  if (isMuted) return;
  const localAudioContext = getAudioContext();
  if (!localAudioContext) return;

  stopAlarmSound(); // Stop any existing alarm sound

  const playBeep = () => {
    if (!localAudioContext || localAudioContext.state !== 'running') return;
    
    alarmOscillator = localAudioContext.createOscillator();
    alarmGainNode = localAudioContext.createGain();

    alarmOscillator.type = 'square'; // A more piercing sound for alarm
    alarmOscillator.frequency.setValueAtTime(880, localAudioContext.currentTime); // A5 note

    alarmGainNode.gain.setValueAtTime(0.0001, localAudioContext.currentTime);
    alarmGainNode.gain.linearRampToValueAtTime(0.15, localAudioContext.currentTime + 0.01); // Slightly louder
    alarmGainNode.gain.exponentialRampToValueAtTime(0.00001, localAudioContext.currentTime + 0.7); // Longer beep

    alarmOscillator.connect(alarmGainNode);
    alarmGainNode.connect(localAudioContext.destination);

    alarmOscillator.start(localAudioContext.currentTime);
    alarmOscillator.stop(localAudioContext.currentTime + 0.7);
  };

  playBeep(); // Play immediately
  alarmInterval = setInterval(playBeep, 1500); // Repeat every 1.5 seconds
};

export const stopAlarmSound = () => {
  if (alarmInterval) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
  if (alarmOscillator) {
    try {
      alarmOscillator.stop();
    } catch (e) { /* Already stopped or not started */ }
    alarmOscillator.disconnect();
    alarmOscillator = null;
  }
  if (alarmGainNode) {
    alarmGainNode.disconnect();
    alarmGainNode = null;
  }
};

// 音效系统 - Web Audio API
let audioContext: any = null;

// 经典模式 - 轻快
const classicMelody = [
  { freq: 523, dur: 0.2 }, { freq: 659, dur: 0.2 }, { freq: 784, dur: 0.2 },
  { freq: 659, dur: 0.2 }, { freq: 523, dur: 0.2 }, { freq: 0, dur: 0.2 },
];

// 节奏模式 - 动感
const rhythmMelody = [
  { freq: 440, dur: 0.15 }, { freq: 554, dur: 0.15 }, { freq: 659, dur: 0.15 },
  { freq: 554, dur: 0.15 }, { freq: 440, dur: 0.15 }, { freq: 0, dur: 0.1 },
];

// 投篮模式 - 活力
const shootMelody = [
  { freq: 392, dur: 0.25 }, { freq: 523, dur: 0.25 }, { freq: 659, dur: 0.25 },
  { freq: 784, dur: 0.25 }, { freq: 659, dur: 0.25 }, { freq: 523, dur: 0.25 },
];

const getMelody = (mode: string) => {
  switch (mode) {
    case 'rhythm': return rhythmMelody;
    case 'shoot': return shootMelody;
    default: return classicMelody;
  }
};

const createSound = (freq: number, duration: number, type: string = 'sine') => {
  if (typeof window === 'undefined' || freq === 0) return;
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.1, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    osc.start();
    osc.stop(audioContext.currentTime + duration);
  } catch (e) {}
};

let musicInterval: any = null;
let isPlaying = false;

export const playBGM = (mode: string) => {
  try {
    stopBGM();
    isPlaying = true;
    const melody = getMelody(mode);
    let i = 0;
    musicInterval = setInterval(() => {
      if (!isPlaying) return;
      const n = melody[i];
      if (n.freq > 0) createSound(n.freq, n.dur, mode === 'shoot' ? 'square' : 'sine');
      i = (i + 1) % melody.length;
    }, 250);
  } catch (e) {}
};

export const stopBGM = () => {
  isPlaying = false;
  if (musicInterval) clearInterval(musicInterval);
};

export const playTap = () => createSound(600, 0.05);
export const playCorrect = () => { createSound(523, 0.1); setTimeout(() => createSound(659, 0.1), 80); setTimeout(() => createSound(784, 0.15), 160); };
export const playWrong = () => { createSound(200, 0.2, 'square'); setTimeout(() => createSound(150, 0.25, 'square'), 150); };
export const playWin = () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => createSound(f, 0.2), i * 100)); };
export const playLose = () => { [400, 350, 300, 250].forEach((f, i) => setTimeout(() => createSound(f, 0.3, 'square'), i * 150)); };

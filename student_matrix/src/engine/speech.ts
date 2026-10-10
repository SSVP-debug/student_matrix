export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function speak(text: string, rate = 1): void {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[#*_`>-]/g, ' '));
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

export const stopSpeaking = () => { if (canSpeak()) window.speechSynthesis.cancel(); };

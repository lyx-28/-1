import { ref } from 'vue'

export function useAudio() {
  const audioContext = ref(null)
  const soundEnabled = ref(true)

  function getContext() {
    if (!audioContext.value) {
      audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioContext.value
  }

  function playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!soundEnabled.value) return

    try {
      const ctx = getContext()
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      gainNode.gain.setValueAtTime(volume, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + duration)
    } catch (e) {
      console.warn('Audio playback failed:', e)
    }
  }

  function playFlip() {
    playTone(440, 0.1, 'sine', 0.2)
  }

  function playMatch() {
    playTone(523, 0.1, 'sine', 0.3)
    setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 100)
    setTimeout(() => playTone(784, 0.15, 'sine', 0.3), 200)
  }

  function playMismatch() {
    playTone(200, 0.2, 'sawtooth', 0.2)
  }

  function playWin() {
    const notes = [523, 587, 659, 784, 880, 988, 1047]
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'sine', 0.25), i * 100)
    })
  }

  function toggleSound() {
    soundEnabled.value = !soundEnabled.value
  }

  return {
    soundEnabled,
    playFlip,
    playMatch,
    playMismatch,
    playWin,
    toggleSound
  }
}
<template>
  <div :class="['app-container', currentTheme]">
    <a href="../" class="back-link">← 返回首页</a>
    
    <header class="game-header">
      <h1>记忆翻牌</h1>
      <span class="version-badge">升级版 v2.0</span>
    </header>

    <div class="stats">
      <div class="stat-item">用时: <span id="timer">{{ formatTime(seconds) }}</span></div>
      <div class="stat-item">步数: <span id="moves">{{ moves }}</span></div>
      <div class="stat-item">得分: <span id="score">{{ score }}</span></div>
    </div>

    <div class="controls">
      <button class="btn" @click="togglePause" v-if="gameStarted && !gameEnded">
        {{ isPaused ? '继续' : '暂停' }}
      </button>
      <button class="btn" @click="initGame">重新开始</button>
    </div>

    <div class="difficulty-select">
      <label for="difficulty">难度:</label>
      <select id="difficulty" v-model="difficulty" @change="onDifficultyChange">
        <option value="easy">简单 (4x3)</option>
        <option value="normal">普通 (4x4)</option>
        <option value="hard">困难 (4x5)</option>
      </select>
    </div>

    <div class="theme-select">
      <span>主题:</span>
      <button
        v-for="theme in themes"
        :key="theme.id"
        :class="['theme-btn', theme.id, { active: currentTheme === theme.id }]"
        @click="setTheme(theme.id)"
        :title="theme.name"
      ></button>
    </div>

    <GameBoard
      ref="gameBoardRef"
      :difficulty="difficulty"
      :is-paused="isPaused"
      :card-symbols="cardSymbols"
      :current-theme="currentTheme"
      @game-update="onGameUpdate"
      @game-over="onGameOver"
    />

    <div class="instructions">
      <p>点击卡片进行翻转</p>
      <p>匹配两张相同的卡片即可消除</p>
      <p>在最短时间内用最少的步数完成挑战！</p>
    </div>

    <div class="leaderboard" v-if="leaderboard.length > 0">
      <h3>排行榜</h3>
      <div
        v-for="(item, index) in leaderboard.slice(0, 5)"
        :key="index"
        class="leaderboard-item"
      >
        <span class="rank">#{{ index + 1 }}</span>
        <span>{{ item.score }}分</span>
        <span>{{ formatTime(item.time) }}</span>
      </div>
    </div>

    <div class="pause-overlay" :class="{ show: isPaused && gameStarted && !gameEnded }">
      <div class="pause-text">游戏暂停</div>
    </div>

    <WinModal
      :show="gameEnded"
      :score="score"
      :high-score="highScore"
      :is-new-high-score="isNewHighScore"
      @play-again="initGame"
      @close="gameEnded = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import GameBoard from './components/GameBoard.vue'
import WinModal from './components/WinModal.vue'

const cardSymbols = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑', '🐶', '🐱', '🐼', '🦁']
const themes = [
  { id: '', name: '默认' },
  { id: 'theme-ocean', name: '海洋' },
  { id: 'theme-forest', name: '森林' },
  { id: 'theme-sunset', name: '日落' }
]

const difficulty = ref('normal')
const currentTheme = ref('')
const gameBoardRef = ref(null)
const gameStarted = ref(false)
const gameEnded = ref(false)
const isPaused = ref(false)
const seconds = ref(0)
const moves = ref(0)
const score = ref(0)
const highScore = ref(0)
const isNewHighScore = ref(false)
const leaderboard = ref([])

const timerInterval = ref(null)

onMounted(() => {
  loadFromStorage()
  initGame()
})

function loadFromStorage() {
  const saved = localStorage.getItem('memoryCardGame')
  if (saved) {
    const data = JSON.parse(saved)
    highScore.value = data.highScore || 0
    leaderboard.value = data.leaderboard || []
    const savedTheme = data.theme || ''
    currentTheme.value = savedTheme
    document.body.className = savedTheme
  }
}

function saveToStorage() {
  localStorage.setItem('memoryCardGame', JSON.stringify({
    highScore: highScore.value,
    leaderboard: leaderboard.value,
    theme: currentTheme.value
  }))
}

function setTheme(theme) {
  currentTheme.value = theme
  document.body.className = theme
  saveToStorage()
}

function formatTime(secs) {
  const mins = Math.floor(secs / 60)
  const s = secs % 60
  return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function startTimer() {
  if (!timerInterval.value) {
    timerInterval.value = setInterval(() => {
      if (!isPaused.value) {
        seconds.value++
      }
    }, 1000)
  }
}

function stopTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
    timerInterval.value = null
  }
}

function togglePause() {
  isPaused.value = !isPaused.value
}

function onDifficultyChange() {
  initGame()
}

function onGameUpdate(data) {
  moves.value = data.moves
  score.value = data.score
  if (!gameStarted.value && data.moves > 0) {
    gameStarted.value = true
    startTimer()
  }
}

function onGameOver(finalScore) {
  stopTimer()
  score.value = finalScore
  gameEnded.value = true
  gameStarted.value = false

  if (finalScore > highScore.value) {
    highScore.value = finalScore
    isNewHighScore.value = true
  } else {
    isNewHighScore.value = false
  }

  leaderboard.value.unshift({
    score: finalScore,
    time: seconds.value,
    date: new Date().toLocaleDateString()
  })
  leaderboard.value.sort((a, b) => b.score - a.score)
  leaderboard.value = leaderboard.value.slice(0, 10)

  saveToStorage()
}

function initGame() {
  stopTimer()
  gameStarted.value = false
  gameEnded.value = false
  isPaused.value = false
  seconds.value = 0
  moves.value = 0
  score.value = 0
  isNewHighScore.value = false

  if (gameBoardRef.value) {
    gameBoardRef.value.initGame()
  }
}
</script>

<style scoped>
.app-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
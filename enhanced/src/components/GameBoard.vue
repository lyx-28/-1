<template>
  <div class="game-board" :style="boardStyle">
    <div
      v-for="card in cards"
      :key="card.index"
      :class="['card', { flipped: card.isFlipped, matched: card.isMatched, shake: card.shake, pop: card.pop }]"
      @click="flipCard(card)"
    >
      <div class="card-inner">
        <div class="card-front"></div>
        <div class="card-back">{{ card.symbol }}</div>
      </div>
    </div>
  </div>
  <Teleport to="body">
    <div
      v-for="floater in scoreFloaters"
      :key="floater.id"
      class="score-float"
      :style="{ left: floater.x + 'px', top: floater.y + 'px' }"
    >
      +{{ floater.score }}
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useAudio } from '../composables/useAudio'

const props = defineProps({
  difficulty: {
    type: String,
    default: 'normal'
  },
  isPaused: {
    type: Boolean,
    default: false
  },
  cardSymbols: {
    type: Array,
    default: () => ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒']
  },
  currentTheme: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['game-update', 'game-over'])

const { playFlip, playMatch, playMismatch, playWin } = useAudio()

const difficultyConfig = {
  easy: { cols: 4, rows: 3, pairs: 6 },
  normal: { cols: 4, rows: 4, pairs: 8 },
  hard: { cols: 4, rows: 5, pairs: 10 }
}

const cards = ref([])
const flippedCards = ref([])
const matchedPairs = ref(0)
const moves = ref(0)
const score = ref(0)
const seconds = ref(0)
const canFlip = ref(true)
const scoreFloaters = ref([])
let floaterId = 0

const boardStyle = computed(() => {
  const config = difficultyConfig[props.difficulty]
  return {
    gridTemplateColumns: `repeat(${config.cols}, 1fr)`
  }
})

watch(() => props.isPaused, (paused) => {
  if (paused) {
  }
})

function shuffle(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

function createCards() {
  const config = difficultyConfig[props.difficulty]
  const symbols = props.cardSymbols.slice(0, config.pairs)
  const cardPairs = [...symbols, ...symbols]
  const shuffled = shuffle(cardPairs)

  return shuffled.map((symbol, index) => ({
    id: index,
    index,
    symbol,
    isFlipped: false,
    isMatched: false,
    shake: false,
    pop: false
  }))
}

function initGame() {
  cards.value = createCards()
  flippedCards.value = []
  matchedPairs.value = 0
  moves.value = 0
  score.value = 0
  canFlip.value = true
  emitGameUpdate()
}

function flipCard(card) {
  if (props.isPaused) return
  if (!canFlip.value) return
  if (card.isFlipped) return
  if (card.isMatched) return
  if (flippedCards.value.length >= 2) return

  playFlip()
  card.isFlipped = true
  flippedCards.value.push(card)

  if (flippedCards.value.length === 2) {
    moves.value++
    checkMatch()
  }

  emitGameUpdate()
}

function checkMatch() {
  canFlip.value = false
  const [card1, card2] = flippedCards.value
  const isMatch = card1.symbol === card2.symbol

  if (isMatch) {
    handleMatch(card1, card2)
  } else {
    handleMismatch(card1, card2)
  }
}

function handleMatch(card1, card2) {
  setTimeout(() => {
    playMatch()
    card1.isMatched = true
    card2.isMatched = true
    card1.pop = true
    card2.pop = true

    matchedPairs.value++
    const config = difficultyConfig[props.difficulty]
    const matchScore = 100
    score.value += matchScore

    showScoreFloater(matchScore)

    setTimeout(() => {
      card1.pop = false
      card2.pop = false
    }, 300)

    flippedCards.value = []
    canFlip.value = true

    emitGameUpdate()

    if (matchedPairs.value === config.pairs) {
      setTimeout(() => {
        const finalScore = calculateFinalScore()
        playWin()
        emit('game-over', finalScore)
      }, 500)
    }
  }, 300)
}

function handleMismatch(card1, card2) {
  setTimeout(() => {
    playMismatch()
    card1.shake = true
    card2.shake = true

    setTimeout(() => {
      card1.isFlipped = false
      card2.isFlipped = false
      card1.shake = false
      card2.shake = false
      flippedCards.value = []
      canFlip.value = true
    }, 500)
  }, 800)
}

function calculateFinalScore() {
  const baseScore = 500
  const timeBonus = Math.max(0, 1000 - seconds.value * 2)
  const movesPenalty = moves.value * 10
  const matchBonus = matchedPairs.value * 100
  return Math.max(0, baseScore + timeBonus - movesPenalty + matchBonus)
}

function showScoreFloater(points) {
  const id = floaterId++
  const x = Math.random() * (window.innerWidth - 50) + 25
  const y = Math.random() * 200 + 100

  scoreFloaters.value.push({ id, score: points, x, y })

  setTimeout(() => {
    scoreFloaters.value = scoreFloaters.value.filter(f => f.id !== id)
  }, 1000)
}

function emitGameUpdate() {
  emit('game-update', {
    moves: moves.value,
    score: score.value,
    matchedPairs: matchedPairs.value
  })
}

onMounted(() => {
  initGame()
})

watch(() => props.difficulty, () => {
  initGame()
})

defineExpose({ initGame })
</script>

<style scoped>
.game-board {
  display: grid;
  gap: 15px;
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}
</style>
<template>
  <div class="modal" :class="{ show }">
    <div class="modal-content" v-if="show">
      <h2 v-if="isNewHighScore">新纪录！</h2>
      <h2 v-else>恭喜通关！</h2>
      <p>你完成了游戏！</p>
      <div class="final-score">{{ score }}</div>
      <p>最终得分</p>
      <p class="high-score" v-if="highScore > 0">最高分: {{ highScore }}</p>
      <button class="btn" @click="$emit('play-again')">再玩一次</button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  },
  highScore: {
    type: Number,
    default: 0
  },
  isNewHighScore: {
    type: Boolean,
    default: false
  }
})

defineEmits(['play-again', 'close'])
</script>

<style scoped>
.modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal.show {
  display: flex;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  animation: modalIn 0.3s ease-out;
}

@keyframes modalIn {
  0% { transform: scale(0.8); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-content h2 {
  color: var(--accent-color, #667eea);
  font-size: 2rem;
  margin-bottom: 15px;
}

.modal-content p {
  color: #666;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.final-score {
  font-size: 3rem;
  color: #ff6b6b;
  font-weight: bold;
  margin: 15px 0;
}

.high-score {
  font-size: 1rem;
  color: #888;
  margin-bottom: 15px;
}
</style>
<script setup lang="ts">
import { reactive } from 'vue'
import { useDragster } from './composables/dragster'

// First array
const array1 = reactive([
  { id: 4453, name: 'Connie 🧸' },
  { id: 456, name: 'Bradley 🧸' },
  { id: 789, name: 'Marvin 🧸' },
  { id: 321, name: 'Simon 🦧' },
  { id: 654, name: 'Klaus 🧸' }
])

// Second array
const array2 = reactive([
  { id: 9874545, name: 'Emma 🤪' },
  { id: 6590, name: 'Bailey 🧸' },
  { id: 322345, name: 'Peanut 🧸' },
  { id: 785659, name: 'Bluebell 🐳' },
  { id: 246766, name: 'Mabel 🧸' }
])

const array3 = reactive([
  { id: 98745445, name: 'Eloise 🤪' },
  { id: 65690, name: 'Elvis 🧸' },
  { id: 3252345, name: 'Alvin 🧸' },
  { id: 7867659, name: 'Holly 🐳' },
  { id: 2476766, name: 'Molly 🧸' }
])

const { lists } = useDragster({
  items: [array1, array2, array3],
  dropZoneClass: 'dragster-dropzone',
  itemClass: 'dragster'
})
</script>

<template>
  <div class="container">
    <h1>Dragster</h1>
    <h2>Easy drag and drop</h2>
    <div class="lists">
      <div class="dragster-dropzone">
        <TransitionGroup name="fade" tag="div">
          <div v-for="item in lists[0]" :key="item.id">
            <div :id="item.id.toString()" class="dragster">
              <h3>
                {{ item.name }}
              </h3>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <div class="dragster-dropzone">
        <TransitionGroup name="fade" tag="div">
          <div v-for="item in lists[1]" :key="item.id">
            <div :id="item.id.toString()" class="dragster">
              <h3>
                {{ item.name }}
              </h3>
            </div>
          </div>
        </TransitionGroup>
      </div>

      <div class="dragster-dropzone">
        <TransitionGroup name="fade" tag="div">
          <div v-for="item in lists[2]" :key="item.id">
            <div :id="item.id.toString()" class="dragster">
              <h3>
                {{ item.name }}
              </h3>
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}
.container {
  text-align: center;
  height: 100vh;
  width: 100vw;
  display: grid;
  place-content: center;
}
.lists {
  display: flex;
  gap: 1rem;
  width: 100%;
  height: max-content;
}

.dragster {
  margin: 1rem;
  background: black;
  border-radius: 0.4rem;
  padding: 1.5rem;
  margin: 5px auto;
  text-align: center;
}

.dragster-dropzone {
  min-width: 200px;
  padding: 2rem;
  transition: 0.5s ease;

  margin-bottom: 10px;
  background: #242424;
  border-radius: 0.4rem;
}

/* 1. declare transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
  position: absolute;
}
</style>

<script setup lang="ts">
import { reactive } from 'vue'
import { useDragster } from './composables/dragster'

// First array
const array1 = reactive([
  { id: 4453, name: 'Connie 🧸' },
  { id: 456, name: 'Cupid 🧸' },
  { id: 789, name: 'Dusky 🧸' },
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

const { lists } = useDragster([array1, array2])
</script>

<template>
  <div class="lists">
    <div class="list-container">
      <div v-for="item in lists[0]" :key="item.id">
        <div :id="item.id.toString()" class="dragster">
          <h2>
            {{ item.name }}
          </h2>
        </div>
      </div>
    </div>

    <div class="list-container">
      <div v-for="item in lists[1]" :key="item.id">
        <div :id="item.id.toString()" class="dragster">
          <h2>
            {{ item.name }}
          </h2>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.lists {
  display: flex;
  gap: 1rem;
  transition: 0.5s ease;
  width: 100%;
}

.dragster {
  margin: 1rem;
  background: black;
  border-radius: 0.4rem;
  padding: 1.5rem;
  margin: 5px auto;
  text-align: center;
}

.list-container {
  padding: 2rem;
  margin-bottom: 10px;
  background: #242424;
  border-radius: 0.4rem;
}
</style>

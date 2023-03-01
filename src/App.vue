<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useDragDrop } from './composables/drag'

// First array
const array1 = reactive([
  { id: 4453, name: 'John' },
  { id: 456, name: 'Mary' },
  { id: 789, name: 'Peter' },
  { id: 321, name: 'Jane' },
  { id: 654, name: 'Tom' }
])

// Second array
const array2 = reactive([
  { id: 9874545, name: 'Sarah' },
  { id: 6590, name: 'David' },
  { id: 322345, name: 'Linda' },
  { id: 785659, name: 'James' },
  { id: 246766, name: 'Grace' }
])

const { lists } = useDragDrop([array1, array2])

onMounted(() => {
  console.log(lists)
})
</script>

<template>
  <div class="lists">
    <div class="list-container">
      <!-- <TransitionGroup tag="div" name="fade" class="container"> -->
      <div v-for="item in lists[0]" :key="item.id">
        <div :id="item.id.toString()" class="draggify">
          <h2>
            {{ item.name }}
          </h2>
        </div>
      </div>
      <!-- </TransitionGroup> -->
    </div>

    <div class="list-container">
      <!-- <TransitionGroup tag="div" name="fade" class="container"> -->
      <div v-for="item in lists[1]" :key="item.id">
        <div :id="item.id.toString()" class="draggify">
          <h2>
            {{ item.name }}
          </h2>
        </div>
      </div>
      <!-- </TransitionGroup> -->
    </div>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.lists {
  display: flex;
  gap: 2rem;
  transition: 0.5s ease;
}

.draggify {
  margin: 1rem;
  background: black;
  border: 1px solid white;
  padding: 1.5rem;
  margin: 5px auto;
}

.list-container {
  padding: 2rem;
  margin-bottom: 10px;
  border: 1px solid white;
}

/* 1. declare transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

/* 2. declare enter from and leave to state */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translate(30px, 0);
}

/* 3. ensure leaving items are taken out of layout flow so that moving
      animations can be calculated correctly. */
.fade-leave-active {
  position: absolute;
}
</style>

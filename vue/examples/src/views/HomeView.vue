<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useDragster } from '../../../index'
import ItemList from '../components/ItemList.vue'

const draggedCounter = ref(0)
const message = ref('You are currently not dragging')

// First array
const array1 = reactive([
  { id: 4453, name: 'Connie 🧸' },
  { id: 456, name: 'Bradley 🧸' },
  { id: 789, name: 'Marvin 🧸' },
  { id: 321, name: 'Simon 🦧' },
  { id: 654, name: 'Klaus 🧸' },
  { id: 6543, name: 'Cindy 🧸' }
])

// Second array
const array2 = reactive([
  { id: 9874545, name: 'Emma 🤪' },
  { id: 6590, name: 'Bailey 🧸' },
  { id: 322345, name: 'Peanut 🧸' },
  { id: 785659, name: 'Bluebell 🐳' },
  { id: 246766, name: 'Mabel 🧸' }
])

const { lists, onDragEnd, onDragStart } = useDragster({
  items: [array1, array2],
  dropZoneClass: 'dragster-dropzone',
  itemClass: 'dragster',
  animationDuration: 200
})

onDragEnd(() => {
  // Do something when drag ends
  draggedCounter.value++
  message.value = 'You are currently not dragging'
})

onDragStart(() => {
  // do something when dragging starts
  message.value = 'You are dragging!'
})
</script>

<template>
  <main>
    <div class="grid place-content-center h-[80vh]">
      <h1
        class="text-8xl leading-[10rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-600"
      >
        Dragster Vue
      </h1>

      <div class="lists grid grid-cols-2 gap-3 mt-8">
        <!-- this is a component -->
        <ItemList :items="lists[0]" />
        <!-- this isn't but it still works -->
        <ItemList :items="lists[1]" />
      </div>
      <div class="container mx-auto text-center my-4">
        <div class="events mt-8">
          <h2 class="text-3xl font-extrabold mb-2 text-gray-700">Available events</h2>
        </div>
        <div class="start">
          <p><span class="font-mono">onDragStart</span>: {{ message }}</p>
        </div>
        <div class="end">
          <p>
            <span class="font-mono">onDragEnd</span>: You have dragged items
            <span class="text-xl font-extrabold">{{ draggedCounter }}</span>
            {{ draggedCounter === 1 ? 'time' : 'times' }}.
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
/* 1. declare transition */
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: transform 0.2s ease;
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

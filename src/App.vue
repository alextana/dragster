<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import { useDragDrop } from './composables/drag'

// First array
const array1 = reactive([
  { id: 123, name: 'John' },
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

const { lists } = useDragDrop([array1, array2], null)

onMounted(() => {
  console.log(lists)
})
</script>

<template>
  <div class="lists">
    <div class="list-container">
      <div v-for="item in lists[0]" :key="item.id">
        <div :id="item.id" class="draggify">
          <h2>
            {{ item.name }}
          </h2>
        </div>
      </div>
    </div>

    <div class="list-container">
      <div v-for="item in lists[1]" :key="item.id">
        <div :id="item.id" class="draggify">
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
</style>

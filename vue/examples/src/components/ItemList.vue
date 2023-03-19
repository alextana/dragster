<template>
  <div class="dragster-dropzone bg-gray-100 border border-gray-300 shadow-xl p-3 rounded-2xl">
    <TransitionGroup name="fade" tag="div">
      <div v-for="item in props.items" :key="item.id">
        <div
          :id="item.id.toString()"
          class="dragster text-center h-[50px] py-2 bg-gray-200 hover:bg-gray-300 my-1 rounded-xl grid place-content-center"
        >
          <h3>{{ item.name }}</h3>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps(['items'])
</script>

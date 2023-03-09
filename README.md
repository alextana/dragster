# Dragster Vue

## Drag and drop composable for Vue 3

The useDragster composable is a Vue.js composition function that allows easy drag and drop functionality for arrays of items. It requires items and dropZoneClass parameters to be passed in for it to work.

## Installation

`npm install @alextana/dragster`

Then in your component you can import the vue composable by doing:
`import { useDragster } from '@alextana/dragster/vue'`

## Usage

Once installed and imported in your file you can use the composable like so:

```vue
const { lists, onDragEnd, onDragStart } = useDragster({ items: [array1, array2],
dropZoneClass: 'dragster-dropzone', itemClass: 'dragster' })
```

### Parameters

The useDragster composable requires a parameters object with the following properties:

- `items` (required): an array of objects representing the items to be dragged and dropped. Each object should have an id property that uniquely identifies the item.
- `dropZoneClass` (required): a string representing the class to be used for the drop zone elements.
- `itemClass` (required): a string representing the class to be used for the draggable item elements.

### Returned object

The useDragster function returns an object with the following properties:

- `lists`: a reactive ref containing the updated lists after drag and drop operations.
- `onDragEnd`: a function that accepts a callback to be executed when the dragging operation ends. Returns an object with an off function that can be used to remove the callback. And it's used like so: `onDragEnd(() => { // do something after drag ends })`

- `onDragStart`: a function that accepts a callback to be executed when the dragging operation starts. Returns an object with an off function that can be used to remove the callback. And it's used like so: `onDragStart(() => { // do something after drag starts })`

## Template

To build your template with draggable items you will need to loop through the returned list from the composable to have reactivity.

A quick example of two lists with draggable items would look like this

```vue
  <script setup>
    import { reactive, ref } from 'vue'
    import { useDragster } from '@alextana/dragster/vue'

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

    const { lists, onDragEnd, onDragStart } = useDragster({
      items: [array1, array2],
      dropZoneClass: 'dragster-dropzone',
      itemClass: 'dragster'
    })

    onDragStart(() => {
      // do something when dragging starts
    })

    onDragEnd(() => {
      // Do something when drag ends
    })
  </script>

  <div class="dragster-dropzone">
    <div v-for="item in lists[0]" :key="item.id">
      <div
        :id="item.id.toString()" class="dragster"
      >
        <h3>
          {{ item.name }}
        </h3>
      </div>
    </div>
  </div>
  <div class="dragster-dropzone">
    <div v-for="item in lists[1]" :key="item.id">
      <div
        :id="item.id.toString()" class="dragster"
      >
        <h3>
          {{ item.name }}
        </h3>
      </div>
    </div>
  </div>
```

## Animations

Animations are not baked in but Vue makes it really easy
to do your own, you could do something like wrapping each list in
a `TransitionGroup` component and adding some styles:

```vue
<TransitionGroup name="fade" tag="div">
    <div v-for="item in lists[1]" :key="item.id">
    <!-- ..... -->
    </div>
  </TransitionGroup>
```

```css
.fade-move,
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-leave-active {
  position: absolute;
}
```

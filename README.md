# Dragster

<img width="1056" alt="image" src="https://github.com/alextana/dragster/assets/24207888/103704d7-0a6b-4e89-9f28-9e75c0a7fa9e">

## Drag and drop hook for React, composable for Vue 3 and Svelte action (coming soon).

useDragster is a function that allows easy drag and drop functionality to shuffle arrays of items. It requires items and dropZoneClass parameters to be passed in for it to work.


## Installation

`npm install @alextana/dragster`

Then in your component you can import the vue composable by doing:

### React
`import { useDragster } from '@alextana/dragster/react'`
### Vue
`import { useDragster } from '@alextana/dragster/vue'`

## Usage

Once installed and imported in your file you can use the composable like so:

```javascript
const { lists, onDragEnd, onDragStart } = useDragster({ items: [obj1, obj2],
dropZoneClass: 'dragster-dropzone', itemClass: 'dragster', animationDuration: 200 })
```


### Parameters

The useDragster composable requires a parameters object with the following properties:

- `items` (required): an array of objects representing the items to be dragged and dropped. Each object should have an id property that uniquely identifies the item.
- `dropZoneClass` (required): a string representing the class to be used for the drop zone elements.
- `itemClass` (required): a string representing the class to be used for the draggable item elements.
- `animationDuration` (optional): if you're using any animation then you'll need to pass the value (in ms) as a Number.

### Returned object

The useDragster function returns an object with the following properties:

- `lists`: a reactive ref containing the updated lists after drag and drop operations.
- `onDragEnd`: a function that accepts a callback to be executed when the dragging operation ends. Returns an object with an off function that can be used to remove the callback. And it's used like so: `onDragEnd(() => { // do something after drag ends })`

- `onDragStart`: a function that accepts a callback to be executed when the dragging operation starts. Returns an object with an off function that can be used to remove the callback. And it's used like so: `onDragStart(() => { // do something after drag starts })`

## Template


### React
Similar to the vue implementation, react uses a custom hook, all you need to do is grab `lists` returned from `useDragster` and loop through it
to create the lists.
`onDragStart` and `onDragEnd` are also available as events, if you need to use them to for example update a value in a database.


```react
import { useDragster } from '@alextana/dragster/react'
import { useAutoAnimate } from '@formkit/auto-animate/react'
// using FormKit's autoAnimate to animate the list with minimal effort

const DragDropExample = () => {
  const sets = [
    [
      { id: 4453, name: 'Potato 🥔' },
      { id: 456, name: 'Aubergine 🍆' },
      { id: 789, name: 'Carrot 🥕 ' },
      { id: 321, name: 'Strawberry 🍓' },
      { id: 654, name: 'Peach 🍑' },
    ],
    [
      { id: 9874545, name: 'Dog 🐶' },
      { id: 6590, name: 'Cat 🐱' },
      { id: 322345, name: 'Whale 🐳' },
      { id: 785659, name: 'Horse 🐴' },
      { id: 246766, name: 'Bear 🧸' },
    ],
  ]

  const { lists, onDragStart, onDragEnd } = useDragster({
    items: sets,
    dropZoneClass: 'dragster-dropzone',
    itemClass: 'dragster',
    animationDuration: 200,
  })

  return (
    <div className='grid grid-cols-1 place-content-center w-full'>
      <div className='lists w-full grid grid-cols-1 lg:grid-cols-2 gap-3 mt-8'>
        {lists &&
          lists.map((list, index) => <ItemList key={index} items={list} />
        )}
      </div>
    </div>
  )
}

const ItemList = ({
  items,
}: {
  items: Array<{ id: number; name: string }>
}) => {
  const [parent] = useAutoAnimate()
  return (
    <div
      ref={parent}
      className='dragster-dropzone transition-colors bg-base-300 border border-primary/60
      shadow-xl hover:shadow-primary/30 p-6 rounded-2xl'
    >
      {items &&
        items.map((item) => (
          <div
            key={item.id}
            id={item.id.toString()}
            className='dragster cursor-grab transition-colors text-center
            h-[50px] py-2 bg-base-100 hover:bg-primary hover:text-primary-content
            my-3 rounded-2xl grid place-content-center'
          >
            <h3>{item.name}</h3>
          </div>
        ))}
    </div>
  )
}

export default DragDropExample
```

### Vue
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
      itemClass: 'dragster',
      animationDuration: 200 // based on the transition declared in css
    })

    onDragStart(() => {
      // do something when dragging starts
    })

    onDragEnd(() => {
      // Do something when drag ends
    })
  </script>

  <div class="dragster-dropzone">
    <div v-for="item in lists" :key="item.id">
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
### React
For react you have multiple options to animate the list, in the component example
you can see how we use `Formkit AutoAnimate` to do it.

### Vue
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
  transition: 0s; /* important so the element doesn't stick when the transition starts */
}
```

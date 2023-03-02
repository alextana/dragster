# Dragster (Package not on npm yet)

The package isn't on npm yet so if you want to try it you'll have to download the composable and import it manually

## Vue 3 composable that allows you to drag and drop elements between lists

Package not ready, usage may change

## Getting started

To start using dragster you have to import it in your vue 3 project, like so:

`import { useDragster } from 'dragster'`

Then you'll have to use `reactive` for your lists, like so:

```javascript
import { reactive } from 'vue'

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
```

And pass in your lists inside an array as the first parameter of the composable:

`const { lists } = useDragster([array1, array2, array3])`

## Markup

The only requirements are:

- Make sure every item in the list has a `dragster` class
- Make sure every item in the list has a unique `id`
- Make sure your loop is keyed

as an example:

```html
<div class="lists">
  <div class="list-container">
    <TransitionGroup name="fade" tag="div">
      <div v-for="item in lists[0]" :key="item.id">
        <div :id="item.id.toString()" class="dragster">
          <h3>{{ item.name }}</h3>
        </div>
      </div>
    </TransitionGroup>
  </div>

  <div class="list-container">
    <TransitionGroup name="fade" tag="div">
      <div v-for="item in lists[1]" :key="item.id">
        <div :id="item.id.toString()" class="dragster">
          <h3>{{ item.name }}</h3>
        </div>
      </div>
    </TransitionGroup>
  </div>
</div>
```

And with a simple animation using Transition group:

```html
<style>
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
```

## All set

The package is not finished yet and next on the development list are events emitted on finalised drag so you can easily do operations like API calls and all the good stuff.

## Accessibility

I want to make the plugin accessible so keyboard users will be able to move items around without having to use a mouse, with screen reader support.

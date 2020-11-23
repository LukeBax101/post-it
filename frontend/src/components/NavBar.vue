<template>
  <div class="nav-bar">
    <button
      v-for="(icon, idx) in icons"
      class="nav-bar-button"
      v-on:click="() => clicked(idx)"
      v-bind:class="{ 'selected': idx === selected}"
      :key="idx"
    >
      <b-icon scale="1.2" :icon="icon"></b-icon>
    </button>
  </div>
</template>

<script>
export default {
  name: 'NavBar',
  props: {
    icons: Array,
    selected: Number,
  },
  methods: {
    clicked(idx) {
      this.$emit('nav-bar-clicked', idx);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.nav-bar {
  position: absolute;
  width: 100%;
  background: white;
  display: flex;
  flex-direction: row;
  bottom: 0;
  height: 50px;
  align-items: center;
  box-shadow: 0 -8px 10px 1px $box-shadow;
}

.nav-bar > .nav-bar-button:first-child {
  border: none;
}

.nav-bar-button {
  border-top: none;
  border-bottom: none;
  border-left: 5;
  border-right: none;
  border-color: $off-white;
  background: white;
  color: $nav-bar-unselected;
  flex-grow: 1;
  cursor: pointer;
  user-select: none;
}

.selected {
  color: $nav-bar-selected;
}

.slide-up-enter-active {
  transition: all .8s ease;
}

.slide-up-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-up-enter, .slide-up-leave-to {
  transform: translateY(50px);
}
</style>

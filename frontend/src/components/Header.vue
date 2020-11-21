<template>
  <div class="header" :key="title">
    <!-- <button v-if="leftIcon" class="button left" v-on:click="leftClicked">
      <b-icon :scale="leftScale" :icon="leftIcon"></b-icon>
    </button> -->
    <h3 v-bind:class="{ 'title': !textTitle, 'text-title': textTitle}">{{ title }}</h3>
    <button v-if="rightIcon" class="button right" v-on:click="rightClicked">
      <b-icon :scale="rightScale" :icon="rightIcon"></b-icon>
    </button>
  </div>
</template>

<script>
export default {
  name: 'Header',
  props: {
    title: String,
    // leftIcon: String,
    // leftScale: String,
    rightIcon: String,
    rightScale: String,
    textTitle: Boolean,
  },
  methods: {
    // leftClicked() {
    //   this.$emit('left-clicked');
    // },
    rightClicked() {
      this.$emit('right-clicked');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.header {
  padding-top: 5px;
  background: $scheme-light;
  display: flex;
  flex-direction: row;
  height: 50px;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 10px 1px $box-shadow;
  border: none;
}

h3 {
  margin: 0;
}

.button {
  position: absolute;
  width: 40px;
  padding: 0;
  border: none;
  background: transparent;
  color: $off-white;
  text-align: center;
  vertical-align: middle;
  user-select: none;
}

.right {
  right: 10px;
}

.title {
  font-family: Arial, Helvetica, sans-serif;
  line-height: 50px;
  font-weight: 600;
  font-style: italic;
  font-size: 0.98rem;
  color: $off-white;
  align-self: center;
  letter-spacing: 0.08em;
  font-variant: small-caps;
}

.text-title {
  font-family: Arial, Helvetica, sans-serif;
  line-height: 25px;
  max-width: calc(100% - 120px);
  font-weight: 300;
  font-style: italic;
  font-size: 1rem;
  color: rgb(50, 50, 50);
  align-self: center;
  letter-spacing: 0.03em;
  font-variant: small-caps;
}

.slide-in-enter-active {
  transition: all .8s ease;
}
.slide-in-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-in-enter {
  transform: translateX(100%);
}

.slide-in-leave-to {
  transform: translateX(-100%);
}
</style>

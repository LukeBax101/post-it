<template>
    <button
      class="float-button"
      v-bind:style="{ 'bottom' : `${(navBar ? 50 : 0) + 20 + (Number(pos) * 65)}px`}"
      v-bind:class="{ 'pulse' : !!pulse, 'orange': orange }"
      v-on:click="() => clicked()"
    >
      <b-icon scale="1.8" :icon="icon"></b-icon>
    </button>
</template>

<script>
export default {
  name: 'FloatButton',
  props: {
    icon: String,
    pos: String,
    pulse: Boolean,
    orange: Boolean,
    navBar: Boolean,
  },
  methods: {
    clicked() {
      this.$emit('float-button-clicked');
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

.float-button {
  position: absolute;
  border: none;
  right: 20px;
  bottom: 70px;
  width: 55px;
  height: 55px;
  box-shadow: 0px 0px 6px, 8px;
  border-radius: 50%;
  background: $scheme-dark;
  color: white;
  box-shadow: 1px 5px 10px 3px rgba(130,130,130,0.5);
}

.slide-in-enter-active {
  transition: all .5s ease;
}
.slide-in-leave-active {
  transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-in-enter, .slide-in-leave-to {
  transform: scale(0.5);
}

.orange {
  background: rgba(255, 121, 63, 1);
}

.pulse.orange {
  background: rgba(255, 121, 63, 1);
  box-shadow: 0 0 0 0 rgba(255, 121, 63, 1);
  animation: pulse-orange 2s infinite;
}

@keyframes pulse-orange {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 121, 63, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(255, 121, 63, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 121, 63, 0);
  }
}
</style>

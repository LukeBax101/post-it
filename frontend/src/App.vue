<template>
  <div id="app">
    <transition name="slide-down">
      <b-alert v-if="show" class="alert" :variant="type" :show="true"> {{ text }}</b-alert>
    </transition>
  <transition :name="transition">
    <router-view class="router"/>
  </transition>
  <b-modal id="help-modal" scrollable centered title="Help">
    <h4> What is the Post-it game? </h4>
    <p> The post-it game is a simple guessing game where each palyer assigns a name
      (normally written on a post-it) to another player. That player must then ask
      <i> yes</i> or <i> no </i> questions to the rest of the group to determine
      their identity. Players take turns going round the group asking
      questions until everyone has discovered their post-it.  </p>
      <br/>
    <h4> What is this? </h4>
    <p> This app is a simple companion to allow a group of people to play
       the post-it game remotely (without the need for real post-its!). To get the best
       experience, the group will already have a voice or video call running
       over which they can ask questions and gauge each other's reactions. </p>
       <br/>
    <h4> How to play </h4>
    <li> A member of the group will need to create a game by clicking
      <b> Create Game </b> and entering a name for themselves.</li>
    <li> They will then enter a lobby with a code at the top which is to be shared
      with the other members of the group. </li>
    <li> Other members join the game by clicking <b> Join Game </b> and entering
      the lobby code as well as their name. </li>
    <li> Once all members have joined the host can start the game by clicking
      <b> Start Game </b>. </li>
    <li> With the game started, players can then click on another players name
      and asseign them a post-it. Be quick however as everyone only gets to give
      and receive one name so get in there before the person you want to post-it
      is already taken. </li>
    <li> Once everyone has a post-it the host can start the guessing phase by
      clicking <b> Next </b>.</li>
    <li> Now just go round the group in the order of play asking <i> yes</i> or
      <i> no </i> questions about your identity. </li>
    <li> The <b> Questions </b> tab is available to help you note questions that
       you've asked (if the host has enabled it) or get recommended questions
       for those new to the game. </li>
    <li> Once you've narrowed down your options and guessed your post-it
      successfully then click the <b> Tick </b> in the lower right corner to
      claim your finishing position in the group. </li>
    <li> Once everyone has guessed their post-it, the results page will show the
      winners (and losers) as well as how long each player took to guess! </li>
    <li> The host can then click <b> Play again! </b> to go back to the lobby and
      start a new round. </li>
      <li> Clicking the <b> i </b> symbol will display extra information about
         the player including their post-it name and who it was given by. </li>
    <br/>
    <h4> Host Options </h4>
    <p> The host has a couple of options to smooth out the progression of the
      game which can be reached from the settings panel in the top right, they are as follows:</p>
    <li> <b>Kick Player</b>  - Remove an unwanted player from the lobby. </li>
    <li> <b>Restart game</b> - Restarts a given game back to the lobby stage
      (all existing post-its will be lost). </li>
    <li> <b> Leave game </b> - Leaves the current game as assigns someone else as host .</li>
    <li> <b> Go to Results </b> - Move directly to the results page regardless of
      whether all players have guessed their post-it or not. </li>
    <p> The host also has the power to remove any post-it they see fit whilst in
       the post-it assign phase. They are also responsible for starting the game
        once everyone is in the lobby and progressing the game once everyone has
         a post-it. </p>
  </b-modal>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import EventBus from './event-bus';

const SYNC_INTERVAL = 60000;

export default {
  name: 'App',
  data() {
    return {
      show: 0,
      text: '',
      type: '',
      transition: 'fade-out',
      lastSync: 0,
      syncInterval: 0,
    };
  },
  mounted() {
    EventBus.$on('show-alert', (data) => {
      this.text = data.text;
      this.type = data.type || 'danger';
      this.show = true;
      setTimeout(() => { this.show = false; }, (data.duration || 2) * 1000);
    });
    this.$router.beforeEach((to, from, next) => {
      this.transition = to.meta?.[from.name]
        ? to.meta?.[from.name]
        : 'fade-out';
      next();
    });
    this.getGameData();
    this.syncInterval = window.setInterval(() => {
      const now = new Date().getTime();
      if ((now - this.lastSync) > SYNC_INTERVAL) {
        this.syncPage();
      }
    }, 5000);
  },
  destroyed() {
    EventBus.$off('show-alert');
  },
  methods: {
    ...mapActions([
      'getGameData',
    ]),
  },
  syncPage() {
    this.lastSync = new Date().getTime();
    this.getGameData();
  },
};
</script>


<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  position: absolute;
  overflow: hidden;
  background: #F0F0F0;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.alert {
  position: absolute;
  width: 100%;
  top: 55px;
  z-index: 10000;
}

.router {
  top: 0px;
}

// Fade
.fade-out-enter-active,
.fade-out-leave-active {
  transition: all 1.8s ease;
}

.fade-out-enter,
.fade-out-leave-to {
  opacity: 0
}


.slide-left-enter-active,
.slide-left-leave-active {
  transition: all .8s ease;
}
.slide-left-enter {
  transform: translateX(100%);
}

.slide-left-leave-to {
  transform: translateX(-100%);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all .4s ease;
}

.slide-down-leave-to,
.slide-down-enter {
  transform: translateY(-210%);
}

.slide-right-enter-active,
.slide-right-leave-active {
  transition: all .8s ease;
}
.slide-right-enter {
  transform: translateX(-100%);
}
.slide-right-leave-to {
  transform: translateX(100%);
}

.grow-enter-active,
.grow-leave-active {
  transition: all .2s ease;
}
.grow-enter,
.grow-leave-to {
  transform: scale(0.7);
  opacity: 0;
}

</style>

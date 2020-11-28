<template>
  <div class="home">
    <img class="title-image" src="@/assets/title-image.png">
    <div class="join-game">
      <b-button class="menu-button" block v-on:click="$bvModal.show('join-game-modal')">
        Join Game
      </b-button>
      <b-button class="menu-button" block v-on:click="$bvModal.show('new-game-modal')">
        Create game
      </b-button>
    </div>
    <!-- Place this tag where you want the button to render. -->
    <github-button
      href="https://github.com/lukebax101"
      data-color-scheme="no-preference: dark; light: light; dark: dark;"
      aria-label="Follow @lukebax101 on GitHub"
      class="github-button"
      >
      Check out the code
    </github-button>
    <transition name="grow">
      <FloatButton
        pos="0"
        icon="question"
        v-on:float-button-clicked="$bvModal.show('help-modal');"
      >
      </FloatButton>
    </transition>
    <div class="copy-right">
      <span> Copyright © Luke Baxter 2021 - v{{version}}</span>
    </div>
    <Modal
      id = "join-game-modal"
      title="Join Game"
      :fields="joinGameModal"
      v-on:submit="joinGameSubmit"
    ></Modal>
    <Modal
      id = "new-game-modal"
      title="Create Game"
      :fields="newGameModal"
      v-on:submit="newGame"
    ></Modal>

  </div>
</template>

<script>
import { mapActions } from 'vuex';
import Modal from '@/components/Modal.vue';
import FloatButton from '@/components/FloatButton.vue';
import GithubButton from 'vue-github-button';

export default {
  name: 'Home',
  components: {
    Modal,
    GithubButton,
    FloatButton,
  },
  data() {
    return {
      version: '1.02',
      newGameModal: [{
        id: 'name',
        label: 'Your Name',
        invalidFeedback: 'Name must be at least a character long',
        isValid: (id) => (id && id.length >= 1),
        type: 'text',
      }],
      joinGameModal: [{
        id: 'gameCode',
        label: 'Game Code',
        invalidFeedback: 'Game code must be four characters long',
        isValid: (id) => (id && Array.isArray(id) && id.every((el) => !!el)),
        type: 'code',
        default: ['', '', '', ''],
      },
      {
        id: 'name',
        label: 'Your Name',
        invalidFeedback: 'Name must be at least a character long',
        isValid: (id) => (id && id.length >= 1),
        type: 'text',
      }],
    };
  },
  mounted() {
    if (this.$cookies.get('secretId')) this.$router.push('/lobby');
  },
  methods: {
    ...mapActions([
      'newGame',
      'joinGame',
    ]),
    joinGameSubmit(val) {
      this.joinGame({
        name: val.name,
        gameCode: val.gameCode.join(''),
      });
    },
  },
};
</script>

<style lang="scss">

.logo {
  position: absolute;
  border-style: solid;
  border-width: 2px;
  border-color: rgba(100,100,100,0.5);
  border-radius: 15px;
  box-shadow: 2px 2px 10px 1px rgba(100,100,100,0.5);
  width: 80%;
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  left: 10%;
  top: 10%;
  font-variant: small-caps;
  font-size: 35px;
}

.join-game {
  padding: 10px;
  position: absolute;
  display: flex;
  flex-direction: column;
  text-align: left;
  width: 80%;
  top: calc(50% - 30px);
  left: 10%;
  border-style: solid;
  border-width: 2px;
  border-color: rgba(100,100,100,0.5);
  border-radius: 15px;
  box-shadow: 2px 2px 10px 1px rgba(100,100,100,0.5);

  :first-child {
    margin-bottom: 10px;
  }
}

.home {
  background-color: #F0F0F0;
}

.title-image {
  position: absolute;
  top: 5%;
  left: calc(50% - 100px);
  width: 200px;
}

.github-button {
  position: absolute;
  bottom: 20px;
  left: calc(50% - 63px);
}

.copy-right {
  justify-content: center;
  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: row;
  position: absolute;
  bottom: 0px;
  padding-bottom: 5px;
  font-size: 12px;
}
</style>

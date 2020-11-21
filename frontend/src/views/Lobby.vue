<template>
  <div class="lobby">
    <b-overlay
      :show="loading"
      spinner-type="grow"
      rounded="sm"
      class="overlay"
    >
      <Header
        v-if="isLobby"
        :title="`Lobby Code: ${gameCode}`"
      ></Header>
      <Header
        v-if="isAssign"
        title="Select a player to give them a post-it name..."
        rightIcon="gear"
        rightScale="1.3"
        textTitle
        v-on:right-clicked="$bvModal.show('settings-modal')"
      ></Header>
      <div class="lobby-list" v-bind:class="{ 'no-footer': noFooter}">
        <List
          v-if="Object.values(players).length > 0"
          :items="players"
          v-on:player-kicked="playerKickedConfirm"
          v-on:post-it-delete="postItDeleteConfirm"
          :isLobby="isLobby"
        >
        </List>
        <div
          v-if="isLobby"
          class='lobby-text'
          v-bind:class="{ 'pulse': !selfHost}"
        >
          <span> {{ lobbyText }}</span>
          <b-form-checkbox
          v-if="selfHost"
          class='question-checkbox'
          v-model="questions"
          name="questions"
          size='lg'
          switch/>
        </div>
        <div v-if="isLobby">
          <b-button
            class='leave-button'
            variant="danger"
            v-on:click="leaveConfirm()"
          >
            Leave game
          </b-button>
          <b-button
            class='leave-button'
            v-if="selfHost && players.length > 1"
            variant="info"
            v-on:click="startConfirm()"
          >
            Start Game
          </b-button>
      </div>
      <div
        v-if="!selfHost && everyOneAssigned"
        class='lobby-text pulse'
      >
        <span> Waiting for the host...</span>
      </div>
      <b-button
        class='leave-button'
        v-if="selfHost && everyOneAssigned"
        variant="info"
        v-on:click="progressGame()"
      >
        Next
      </b-button>
    </div>
    </b-overlay>
    <Modal
      id = "settings-modal"
      title="Settings"
      :fields="selfHost ? hostOptions : playerOptions"
      noSubmit
    ></Modal>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Header from '@/components/Header.vue';
import List from '@/components/List.vue';
import Modal from '@/components/Modal.vue';


export default {
  name: 'Lobby',
  components: {
    Header,
    List,
    Modal,
  },
  data() {
    return {
      loading: false,
      playerOptions: [{
        id: 'leave',
        label: 'Leave Game',
        variant: 'danger',
        onClick: () => this.leaveConfirm(),
        isValid: () => true,
        type: 'button',
      }],
    };
  },
  async mounted() {
    this.load();
  },
  computed: {
    ...mapGetters([
      'questionsEnabled',
      'gameCode',
      'players',
      'selfHost',
      'gameState',
      'playerId',
    ]),
    noFooter() {
      return this.isAssign && !this.everyOneAssigned;
    },
    everyOneAssigned() {
      return this.players.filter((player) => !player.post_it_name).length === 0;
    },
    hostOptions() {
      return [{
        id: 'leave',
        label: 'Leave Game',
        variant: 'danger',
        onClick: () => this.leaveConfirm(),
        type: 'button',
      },
      {
        id: 'kick',
        label: 'Kick Player',
        variant: 'danger',
        contents: this.players.filter((player) => player.player_id !== this.playerId),
        onClick: (player) => this.playerKickedConfirm(player),
        type: 'button-dropdown',
      },
      {
        id: 'restart',
        label: 'Restart game',
        variant: 'info',
        onClick: () => this.restartGameConfirm(),
        type: 'button',
      }];
    },
    isLobby() {
      return this.gameState === 0;
    },
    isAssign() {
      return this.gameState >= 1;
    },
    lobbyText() {
      return this.selfHost ? 'Enable questions:' : 'Waiting for the host to start the game...';
    },
    questions: {
      // getter
      get() {
        return this.questionsEnabled;
      },
      // setter
      set(newValue) {
        if (newValue !== this.questionsEnabled) {
          this.toggleQuestions();
        }
      },
    },
  },
  methods: {
    ...mapActions([
      'getGameData',
      'leaveGame',
      'kickPlayer',
      'toggleQuestions',
      'startGame',
      'restartGame',
      'progressGame',
      'deletePostIt',
    ]),
    async playerKickedConfirm(player) {
      const confirmed = await this.$bvModal.msgBoxConfirm(`Are you sure you want to kick ${player.name}?`, {
        title: 'Are you sure?',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      });
      if (confirmed) {
        this.kickPlayer(player.player_id);
      }
    },
    async restartGameConfirm() {
      const confirmed = await this.$bvModal.msgBoxConfirm('Are you sure you want to restart the game?', {
        title: 'Are you sure?',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      });
      if (confirmed) {
        this.restartGame();
      }
    },
    async postItDeleteConfirm(player) {
      console.log(player);
      const confirmed = await this.$bvModal.msgBoxConfirm('Are you sure you want to delete this post-it?', {
        title: 'Are you sure?',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      });
      if (confirmed) {
        this.deletePostIt({ playerId: player.player_id });
      }
    },
    async load() {
      this.loading = true;
      await this.getGameData();
      this.loading = false;
    },
    async leaveConfirm() {
      const confirmed = await this.$bvModal.msgBoxConfirm('Are you sure you wish to leave?', {
        title: 'Are you sure?',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      });
      if (confirmed) {
        this.leaveGame();
      }
    },
    async startConfirm() {
      const confirmed = await this.$bvModal.msgBoxConfirm('Are you sure you want to start the game?', {
        title: 'All ready?',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'success',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true,
      });
      if (confirmed) {
        this.startGame();
      }
    },
  },
};
</script>

<style lang="scss">
.lobby {
  position: absolute;
  width: 100%;
  height: 100%;
}

.lobby-list {
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
  background-color: $app-background;
}

.no-footer {
  height: 100%;
}

.overlay{
  width: 100%;
  height: 100%;
  color: $overlay-load;
}

.leave-button {
  margin: 10px;
}

.lobby-text {
  display: flex;
  flex-direction: rows;
  justify-content: center;
  align-items: center;
  margin: 5px;
  font-size: 17px;
}

.question-checkbox {
  margin-left: 10px;
}

@keyframes pulse {
    0% { transform: scale(0.9); opacity: 0.4; }
    50% { transform: scale(1); opacity: 1; }
    100% { transform: scale(0.9); opacity: 0.4; }
}

.pulse {
  font-size: 17px;
  -webkit-animation: pulse 3s infinite ease-in-out;
  -o-animation: pulse 3s infinite ease-in-out;
  -ms-animation: pulse 3s infinite ease-in-out;
  -moz-animation: pulse 3s infinite ease-in-out;
  animation: pulse 3s infinite ease-in-out;
}

</style>

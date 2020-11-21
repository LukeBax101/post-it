<template>
  <div class="play-area">
    <b-overlay
      :show="loading"
      spinner-type="grow"
      rounded="sm"
      class="overlay"
    >
      <Header
        title="Play Area"
        rightIcon="gear"
        rightScale="1.3"
        v-on:right-clicked="$bvModal.show('settings-modal')"
      ></Header>
      <div class="play-area-body">
        <div class="tutorial-header">Tutorial</div>
        <div class="tutorial-text">
          <p>- Now just go round the group one-by-one asking <i>yes</i> or
            <i>no</i> questions about your identity.</p>
          <p>- If you want to see everybody's post-its or want a recommended
             order of play to get started then click <b>'Recommended Order'</b> below.</p>
          <p>- Stuck for what to ask as a question? Click <b>'Starter questions'</b> below.</p>
          <p>- Once you've guessed your post it (and everyone else agrees you've
            got it!), click <b>'I've got it!''</b> below to confirm your finishing position! </p>
            <p> _</p>
        </div>
        <b-button
          class='recommended-order'
          variant="info"
          v-on:click="$bvModal.show('recommended-order-modal');"
        >
          Recommended Order
        </b-button>
        <b-button
          class='starter-questions'
          variant="info"
          v-on:click="$bvModal.show('starter-questions-modal');"
        >
          Starter Questions
        </b-button>
        <div class="question-area">
          Question log disabled on this game...
        </div>
        <b-button
          class='win-button'
          variant="info"
          v-on:click="claimWinConfirm()"
        >
          I've got it!
        </b-button>
      </div>
    </b-overlay>
    <Modal
      id = "settings-modal"
      title="Settings"
      :fields="selfHost ? hostOptions : playerOptions"
      noSubmit
    ></Modal>
    <b-modal id="recommended-order-modal" scrollable centered title="Recommended Order">
      <b-list-group>
        <b-list-group-item
          v-for="(item, idx) in recommendedOrder"
          v-bind:key="item.player_id"
          :variant="item.completed_at ? 'success': null"
        >
          {{ idx + 1 }}. {{ item.name }} -> {{ item.post_it_name }}
        </b-list-group-item>
      </b-list-group>
  </b-modal>
  <b-modal id="starter-questions-modal" centered title="Starter Questions">
    Starter questions
  </b-modal>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Header from '@/components/Header.vue';
import Modal from '@/components/Modal.vue';

export default {
  name: 'PlayArea',
  components: {
    Header,
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
      order: [1, 2, 3],
    };
  },
  computed: {
    ...mapGetters([
      'selfHost',
      'players',
      'recommendedOrder',
    ]),
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
  },
  async mounted() {
    this.load();
  },
  methods: {
    ...mapActions([
      'getGameData',
      'leaveGame',
      'restartGame',
      'kickPlayer',
      'claimWin',
    ]),
    async load() {
      this.loading = true;
      await this.getGameData();
      this.loading = false;
    },
    async claimWinConfirm() {
      const confirmed = await this.$bvModal.msgBoxConfirm('Are you sure you\'ve guessed right?', {
        title: 'Are you sure?',
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
        this.claimWin();
      }
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
  },
};
</script>

<style lang="scss">
.play-area {
  position: absolute;
  width: 100%;
  height: 100%;
}

.overlay{
  width: 100%;
  height: 100%;
  color: $overlay-load;
}

.play-area-body {
  display: grid;
  width: 100%;
  height: calc(100% - 50px);
  grid-template-columns: 50% 50%;
  grid-template-rows: 20px 120px 60px auto 60px;
}

.question-area {
  grid-row: 4;
  grid-column: 1 / span 2;
  display: flex;
  justify-content: center;
  align-items: center;
}

.win-button {
  grid-row: 5;
  grid-column: 1 / span 2;
  margin: 10px;
}

.tutorial-header {
  grid-row: 1;
  grid-column: 1 / span 2;
  align-self: start;
  font-family: cursive;
}

.tutorial-text {
  grid-row: 2;
  grid-column: 1 / span 2;
  font-size: 12px;
  justify-selft: center;
  margin: 10px;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 10% 50%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 10% 50%, transparent 100%);
  font-family: cursive;
  overflow-y: scroll;
}

.recommended-order {
  grid-row: 3;
  grid-column: 1;
  margin: 10px;
  font-size: 13px;
  margin-right: 5px;
}

.starter-questions {
  grid-row: 3;
  grid-column: 2;
  margin-left: 5px;
  margin: 10px;
  font-size: 13px;
}

</style>

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
        <div class="order-panel" v-if="isOrder">
          <h5>Order of Play</h5>
          <b-list-group>
            <b-list-group-item
              v-for="(item, idx) in recommendedOrder"
              v-bind:key="item.player_id"
              :variant="item.completed_at ? 'success' : null"
              class="order-item"
            >
            <div>
              {{ idx + 1 }}.
            </div>
            <div class="order-item-name">
              {{ `‏‏‎ ‎‏‏‎ ‎${item.name}‏‏‎ ‎‏‏‎ ‎` }}
            </div>
            →
            <div class="order-item-value">
            {{ `‏‏‎ ‎‏‏‎ ‎${item.post_it_name}‏‏‎ ‎‏‏‎ ‎` }}
            </div>
            <div
              class="icon-end"
              v-on:click.stop="showPlayerInfo(item)"
            >
              <b-icon icon="info-circle"></b-icon>
            </div>
            </b-list-group-item>
          </b-list-group>
        </div>
        <div class="question-panel" v-if="!isOrder">
          <h5>Question Notes</h5>
          <p> Exciting changes coming soon... </p>
        </div>
        <b-button
          class='win-button'
          v-if="notYetWon"
          variant="info"
          v-on:click="claimWinConfirm()"
        >
          I've got it!
        </b-button>
        <div
          v-if="!notYetWon"
          class='lobby-text pulse'
        >
          <span> Good job! Just waiting on the others now... </span>
        </div>
      </div>
      <NavBar
        :icons="navBarIcons"
        :selected="isOrder ? 0 : 1"
        v-on:nav-bar-clicked="navBarClicked"
      ></NavBar>
    </b-overlay>
    <Modal
      id = "settings-modal"
      title="Settings"
      :fields="selfHost ? hostOptions : playerOptions"
      noSubmit
    ></Modal>
    <b-modal id="player-info-modal" centered title="Player Info">
      <div style="display: flex; flex-direction: column;">
        <div>
            <b>Player Name:</b>
        </div>
        <div>{{ playerInfo.name }}</div>
      </div>
      <div style="display: flex; flex-direction: column;">
        <div>
          <b>Post-it:</b>
        </div>
        <div>  {{ playerInfo.post_it_name }}</div>
      </div>
      <div style="display: flex; flex-direction: column;">
        <div>
            <b>Given By:</b>
        </div>
        <div>{{ playerInfoGiver }}</div>
      </div>
    </b-modal>
    <canvas id="confetti-canvas" class="confetti-canvas"></canvas>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Header from '@/components/Header.vue';
import Modal from '@/components/Modal.vue';
import NavBar from '@/components/NavBar.vue';
import ConfettiGenerator from 'confetti-js';

export default {
  name: 'PlayArea',
  components: {
    Header,
    Modal,
    NavBar,
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
      navBarIcons: ['card-list', 'pencil-square'],
      isOrder: true,
      playerInfo: '',
      confetti: null,
    };
  },
  computed: {
    ...mapGetters([
      'selfHost',
      'players',
      'recommendedOrder',
      'playerId',
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
    playerInfoGiver() {
      const giverPlayer = this.playerInfo.giver_player_id && this.players
        .find((storedPlayer) => storedPlayer.player_id === this.playerInfo.giver_player_id);
      return giverPlayer ? giverPlayer.name : 'Unknown';
    },
    notYetWon() {
      const player = this.players.find((play) => play.player_id === this.playerId);
      if (!player) return true;
      return !player.completed_at;
    },
  },
  async mounted() {
    this.load();
    const confettiSettings = {
      target: 'confetti-canvas',
      respawn: false,
      start_from_edge: true,
      rotate: true,
    };
    this.confetti = new ConfettiGenerator(confettiSettings);
  },
  methods: {
    ...mapActions([
      'getGameData',
      'leaveGame',
      'restartGame',
      'kickPlayer',
      'claimWin',
    ]),
    showConfetti() {
      this.confetti.render();
      setTimeout(() => {
        this.confetti.clear();
      }, 15000);
    },
    showPlayerInfo(player) {
      this.playerInfo = player;
      this.$bvModal.show('player-info-modal');
    },
    navBarClicked(idx) {
      this.isOrder = idx === 0;
    },
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
        this.showConfetti();
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
.confetti-canvas {
  position: absolute;
  top: 0px;
  height: 100vh;
  left: 0px;
  width: 100vw;
  pointer-events: none;
}

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
  height: calc(100% - 100px);
  grid-template-columns: 50% 50%;
  grid-template-rows: 40px 120px 60px auto 60px;
}

.order-panel {
  grid-column: 1 / span 2;
  grid-row: 1 / span 4;
}

.question-panel {
  grid-column: 1 / span 2;
  grid-row: 1 / span 4;
}

.order-item {
  display: flex;
  justify-content: space-between;
}

.order-item-name {
  flex-grow: 2;
  max-width: 100px;
  overflow-x: scroll;
  white-space: nowrap;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10% 90%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0%, black 10% 90%, transparent 100%);
}

.order-item-value {
  flex-grow: 2;
  max-width: 100px;
  overflow-x: scroll;
  white-space: nowrap;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 5% 95%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0%, black 5% 95%, transparent 100%);
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

.lobby-text {
  grid-column: 1 / span 2;
  display: flex;
  flex-direction: rows;
  justify-content: center;
  align-items: center;
  margin: 5px;
  font-size: 17px;
}
</style>

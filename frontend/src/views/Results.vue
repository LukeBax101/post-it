<template>
  <div class="results">
    <b-overlay
      :show="loading"
      spinner-type="grow"
      rounded="sm"
      class="overlay"
    >
      <Header
        title="Results"
        rightIcon="gear"
        rightScale="1.3"
        v-on:right-clicked="$bvModal.show('settings-modal')"
      ></Header>
      <div class="results-body">
        <b-table striped hover class="results-table" :items="results" :fields="fields"></b-table>
        <b-button
          class='play-again-button'
          v-if="selfHost"
          variant="info"
          v-on:click="restartGame()"
        >
          Play again?
        </b-button>
        <div
          v-if="!selfHost"
          class='play-again-button pulse'
        >
          <span> Waiting for the host...</span>
        </div>
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
import { mapGetters, mapActions } from 'vuex';
import Header from '@/components/Header.vue';
import Modal from '@/components/Modal.vue';

export default {
  name: 'Results',
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
      fields: ['pos', 'name', 'post-it', 'split'],
    };
  },
  computed: {
    ...mapGetters([
      'selfHost',
      'players',
      'playerResults',
    ]),
    results() {
      const baseTime = new Date(this.playerResults[0].completed_at);
      return this.playerResults.map((player, idx) => ({
        pos: this.genPos(idx + 1),
        name: player.name.length > 8 ? `${player.name.slice(0, 8)}...` : player.name,
        'post-it': player.post_it_name?.length > 8 ? `${player.post_it_name.slice(0, 8)}...` : player.post_it_name,
        split: this.genSplit(new Date(player.completed_at) - baseTime),
      }));
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
    ]),
    genPos(n) {
      let suffix = ['th', 'st', 'nd', 'rd', 'th'][Math.min(n % 10, 4)];
      if ((n % 100) >= 11 && (n % 100) <= 13) {
        suffix = 'th';
      }
      return `${n}${suffix}`;
    },
    genSplit(duration) {
      const milliseconds = parseInt((duration % 1000) / 100, 10);
      let seconds = Math.floor((duration / 1000) % 60);
      let minutes = Math.floor((duration / (1000 * 60)) % 60);

      minutes = (minutes < 10) ? `0${minutes}` : minutes;
      seconds = (seconds < 10) ? `0${seconds}` : seconds;
      return `+${minutes}:${seconds}.${milliseconds}`;
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
  },
};
</script>

<style lang="scss">
.results {
  position: absolute;
  width: 100%;
  height: 100%;
}

.overlay{
  width: 100%;
  height: 100%;
  color: $overlay-load;
}

.results-body {
  display: grid;
  width: 100%;
  height: calc(100% - 50px);
  grid-template-rows: 30px auto 60px;
}

.results-table {
  grid-row: 2;
}

.play-again-button {
  grid-row: 3;
  margin: 10px;
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

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
        <b-table
          striped
          hover
          small
          class="results-table"
          :items="results"
          :fields="fields"
        >
        <template #cell(showDetails)="row">
        <div
          @click="row.toggleDetails"
        >
          <b-icon icon="info-circle"></b-icon>
        </div>
      </template>
      <template #row-details="row">
        <b-card class="card">
          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Post-it:</b></b-col>
            <b-col class="results-text">{{ row.item.postIt }}</b-col>
          </b-row>

          <b-row class="mb-2">
            <b-col sm="3" class="text-sm-right"><b>Given By:</b></b-col>
            <b-col class="results-text">{{ row.item.giverPlayer }}</b-col>
          </b-row>

          <b-button size="sm" @click="row.toggleDetails">Hide Details</b-button>
        </b-card>
      </template>
        </b-table>
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
      confetti: null,
      fields: [
        'pos',
        'name',
        'split',
        { key: 'showDetails', label: '' },
      ],
    };
  },
  computed: {
    ...mapGetters([
      'selfHost',
      'players',
      'playerResults',
    ]),
    results() {
      const baseTime = this.playerResults[0]
        ? new Date(this.playerResults[0].completed_at) : null;
      return this.playerResults.map((player, idx) => {
        if (!player) return null;
        const giverPlayer = this.players.find((play) => play.giver_player_id === player.player_id);
        return {
          pos: this.genPos(idx + 1),
          name: player.name.length > 18 ? `${player.name.slice(0, 18)}...` : player.name,
          postIt: `‏‏‎ ‎‏‏‎ ‎${player.post_it_name}`,
          split: baseTime && player.completed_at ? this.genSplit(new Date(player.completed_at) - baseTime) : '--:--',
          giverPlayer: giverPlayer ? `‏‏‎ ‎‏‏‎ ‎${giverPlayer.name}‏‏‎ ‎‏‏‎ ‎` : 'Unknown',
        };
      }).filter((x) => !!x);
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
  overflow-y: scroll;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 5% 97%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, black 5% 97%, transparent 100%);
}

.results-table {
  grid-row: 2;
}

div.card-body {
 padding: 10px;
 width: calc(100vw - 12px);
}

div.results-text.col {
  padding: 5px;
  margin-left: 20px;
  margin-right: 20px;
  width: calc(100vw - 32px);
  overflow-x: scroll;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10% 90%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0%, black 10% 90%, transparent 100%);
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

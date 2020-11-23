<template>
  <div class="list">
    <transition-group
      name="slide"
      v-bind:css="false"
      v-on:before-enter="beforeEnter"
      v-on:enter="enter"
      v-on:leave="leave"
    >
      <div
        v-for="(item, idx) in items"
        v-bind:key="item.player_id"
        class="item"
      >
      <div class="button-container"
      v-bind:class="{ 'btn-block-margin': isLobby || currentSelectedPlayer !== item}">
        <b-button
          block
          variant="light"
          class="button-item"
          v-on:click="itemClicked(item)"
          v-bind:data-index="idx"
          v-bind:class="{
            'self-item': item.player_id === playerId,
            'giver-item': !isLobby && item.giver_player_id === playerId,
            'taken-item': !isLobby && item.player_id !== playerId
              && item.giver_player_id !== playerId
              && (item.post_it_name || alreadyGiven),
          }"

        >
          <div class="icon-start">
            <b-icon
              v-if="hostId === item.player_id"
              icon="controller"
            >
            </b-icon>
          </div>
          <div v-if="!isLobby" class="icon-start-2">
            <b-icon
              v-if="canPostIt.includes(item.player_id)"
              icon="arrow-right"
            >
            </b-icon>
          </div>
          <div class="text-container">
            <span class="text">
              {{ `‏‏‎ ‎‏‏‎ ‎${item.name}` }}
            </span>
            <span class="text" style="white-space: nowrap;" v-if="item.post_it_name">
              {{ `‏‏‎ ‎‏‏‎ ‎↳ ${item.post_it_name}‏‏‎ ‎‏‏‎ ‎`}}
            </span>
          </div>
          <div
            v-if="selfHost && item.player_id !== playerId && isLobby"
            :id="`kick-button-${idx}`"
            class="icon-end"
            v-on:click.stop="$emit('player-kicked', item)"
          >
            <b-icon icon="x-square"></b-icon>
          </div>
          <div
            v-if="((selfHost && item.post_it_name) || item.giver_player_id == playerId) && !isLobby"
            :id="`delete-button-${idx}`"
            class="icon-end-2"
            v-on:click.stop="deleteClicked(item)"
          >
            <b-icon icon="trash"></b-icon>
          </div>
          <div
            v-if="item.post_it_name && !isLobby"
            :id="`info-button-${idx}`"
            class="icon-end"
            v-on:click.stop="showPlayerInfo(item)"
          >
            <b-icon icon="info-circle"></b-icon>
          </div>
        </b-button>
      </div>
      <div class="post-it" v-if="!isLobby && currentSelectedPlayer === item">
        <b-input-group
          class="post-it-input"
        >
          <b-form-input
            v-model="currentSelectedValue"
            class="post-it-input"
            placeholder="Enter a name or item"
          ></b-form-input>
          <!-- <b-form-invalid-feedback id="input-live-feedback">
              Enter at least 3 letters
          </b-form-invalid-feedback> -->
          <b-input-group-append>
            <b-button
              class="post-it-input"
              variant="info"
              v-on:click="submitPostitClicked()"
            >
            Post-it!
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </div>
    </div>
    </transition-group>
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
  </div>
</template>

<script>
import Velocity from 'velocity-animate';
import { mapGetters, mapActions } from 'vuex';
import EventBus from '@/event-bus';


export default {
  name: 'List',
  props: {
    items: Array,
    isLobby: Boolean,
  },
  data() {
    return {
      currentSelectedPlayer: null,
      currentSelectedValue: '',
      playerInfo: '',
    };
  },
  computed: {
    ...mapGetters([
      'playerId',
      'selfHost',
      'hostId',
      'players',
    ]),
    canPostIt() {
      return this.players
        .filter((player) => {
          const postPlayersThatHaveNotGiven = this.playersThatHaveNotGiven
            .filter((playerId) => playerId !== this.playerId);
          const postPlayersThatHaveNotReceived = this.playersNotYetRecieved
            .filter((playerId) => playerId !== player.player_id);
          const noLonely = postPlayersThatHaveNotGiven.length !== 1
            || postPlayersThatHaveNotReceived.length !== 1
            || postPlayersThatHaveNotGiven[0] !== postPlayersThatHaveNotReceived[0];
          return this.playerId !== player.player_id
          && !this.playersThatHaveGiven.includes(this.playerId)
          && this.playersNotYetRecieved.includes(player.player_id)
          && noLonely;
        }).map((player) => player.player_id);
    },
    alreadyGiven() {
      return this.playersThatHaveGiven.includes(this.playerId);
    },
    playersThatHaveNotGiven() {
      return this.players
        .filter((player) => !this.playersThatHaveGiven.includes(player.player_id))
        .map((player) => player.player_id);
    },
    playersThatHaveGiven() {
      return this.players
        .filter((player) => player.giver_player_id)
        .map((player) => player.giver_player_id);
    },
    playersNotYetRecieved() {
      return this.players
        .filter((player) => !player.post_it_name)
        .map((player) => player.player_id);
    },
    playerInfoGiver() {
      const giverPlayer = this.playerInfo.giver_player_id && this.players
        .find((storedPlayer) => storedPlayer.player_id === this.playerInfo.giver_player_id);
      return giverPlayer ? giverPlayer.name : 'Unknown';
    },
  },
  methods: {
    ...mapActions([
      'submitPostIt',
    ]),
    deleteClicked(item) {
      let postPlayersThatHaveNotGiven = this.playersThatHaveNotGiven;
      if (item.giver_player_id) {
        postPlayersThatHaveNotGiven = [...postPlayersThatHaveNotGiven, item.giver_player_id];
      }
      const postPlayersThatHaveNotReceived = [...this.playersNotYetRecieved, item.player_id];
      const noLonely = postPlayersThatHaveNotGiven.length !== 1
        || postPlayersThatHaveNotReceived.length !== 1
        || postPlayersThatHaveNotGiven[0] !== postPlayersThatHaveNotReceived[0];
      if (noLonely) {
        this.$emit('post-it-delete', item);
      } else {
        EventBus.$emit('show-alert', { text: 'Can\'t leave one person to post-it themselves', type: 'warning' });
      }
    },
    itemClicked(item) {
      if (this.canPostIt.includes(item.player_id)) {
        this.currentSelectedPlayer = item;
        this.currentSelectedValue = '';
      }
    },
    submitPostitClicked() {
      this.submitPostIt({
        playerId: this.currentSelectedPlayer.player_id,
        postIt: this.currentSelectedValue,
      });
    },
    beforeEnter(el) {
      const element = el;
      element.style.transform = 'translateX(100%)';
    },
    showPlayerInfo(player) {
      this.playerInfo = player;
      this.$bvModal.show('player-info-modal');
    },
    enter(el, done) {
      const delay = el.dataset.index * 150;
      setTimeout(() => {
        Velocity(
          el,
          { translateX: [0, 500] },
          { complete: done },
        );
      }, delay);
    },
    leave(el, done) {
      const delay = el.dataset.index * 150;
      setTimeout(() => {
        Velocity(
          el,
          { translateX: [-500, 0] },
          { complete: done },
        );
      }, delay);
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

.list {
  width: 100%;
  position:relative;
  overflow-y:auto;
  overflow-x:hidden;
  height: calc(100% - 50px);
}

.text {
  max-width: 80%;
}

.self-item {
  background-color: rgba(255, 165, 32, 0.2);
}

.giver-item {
  background-color: rgba(0, 165, 32, 0.2);
}

.taken-item {
  background-color: rgba(100, 100, 100, 0.2);
}

.item:last-child {
  margin-bottom: 20px;
}

.item:first-child {
  margin-top: 10px;
}

.btn-block {
  height: 60px;
  border: none;
  box-shadow: 4px 2px 10px 6px $box-shadow;
  font-weight: bold;
  padding: 6px;
}

.button-item {
  position: relative;
  align-items: center;
}

.btn-block-margin {
  margin-bottom: 5px;
}

.text-container {
  position: absolute;
  width: calc(100% - 140px);
  left: 60px;
  height: 60px;
  top: 0px;
  display: flex;
  flex-direction: column;
  overflow-x: scroll;
  justify-content: center;
  align-items: center;
  align-self: stretch;
  white-space: nowrap;
  -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10% 90%, transparent 100%);
  mask-image: linear-gradient(to right, transparent 0%, black 10% 90%, transparent 100%);
}

.icon-start {
  position: absolute;
  width: 35px;
  top: 18px;
}

@keyframes point {
    0% { transform: translateX(00px); }
    50% { transform: translateX(15px); }
    100% { transform: translateX(0px); }
}

.icon-start-2 {
  position: absolute;
  width: 35px;
  left: 35px;
  top: 18px;
  -webkit-animation: point 1.5s infinite ease-in-out;
  -o-animation: point 1.5s infinite ease-in-out;
  -ms-animation: point 1.5s infinite ease-in-out;
  -moz-animation: point 1.5s infinite ease-in-out;
  animation: point 1.5s infinite ease-in-out;
}

.icon-end {
  width: 35px;
  right: 0px;
  top: 18px;
  position: absolute;
}
.icon-end-2 {
  position: absolute;
  width: 35px;
  right: 35px;
  top: 18px;
}

.post-it {
  position: relative;
  height: 50px;
  width: 90%;
  left: 5%;
}

.post-it-input {
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  border-top-width: 0px;
}

</style>

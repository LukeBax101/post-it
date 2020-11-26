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
        <div class="order-panel" v-bind:class="{ 'no-bottom-banner': notYetWon}" v-if="isOrder">
          <h5 class="order-title">Order of Play</h5>
          <b-list-group class="order-panel-main">
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
        <div class="question-panel" v-bind:class="{ 'no-bottom-banner': notYetWon}" v-if="!isOrder">
          <h5 class="question-title">Question Log</h5>
          <b-button
            class='starter-questions-button'
            variant="info"
            v-on:click="$bvModal.show('starter-question-modal')"
          >
            Starter Questions
          </b-button>
          <div v-if="!questionsEnabled" class="no-question-log">
            Question log disabled for this game by the host...
          </div>
          <div v-if="questionsEnabled" class="question-panel-main">
          <b-list-group class="question-panel-question">
            <b-list-group-item
              v-for="(item) in questions"
              v-bind:key="item.question_id"
              class="question-panel-question-item"
            >
              <b-input
                class="question-panel-question-item-text"
                maxlength="255"
                v-model="item.question"
                v-on:blur="questionBlurred(item)"
              >
              </b-input>
            </b-list-group-item>
            <b-list-group-item
              class="question-panel-question-item"
            >
              <b-input
                class="question-panel-question-item-text"
                maxlength="255"
                v-model="newQuestionValue"
                v-on:blur="newQuestionBlurred()"
                placeholder="Add question here"
              >
              </b-input>
            </b-list-group-item>
          </b-list-group>
          <b-list-group class="question-panel-answer">
            <b-list-group-item
              v-for="(item) in questions"
              v-bind:key="item.question_id"
              class="question-panel-answer-item"
            >
            <b-form-group>
              <b-form-radio-group
                v-model="item.answer"
                v-on:change="(val) => answerClicked(item, val)"
                class="question-panel-answer-item-checkbox"
                :options="[{ text: 'Yes', value: true}, { text: 'No', value: false }]"
                buttons
                button-variant="outline-info"
                size="sm"
                name="buttons-2"
              ></b-form-radio-group>
            </b-form-group>
            </b-list-group-item>
            <b-list-group-item
              class="question-panel-answer-item"
            >
            <b-form-group>
              <b-form-radio-group
                v-model="newQuestionAnswer"
                class="question-panel-answer-item-checkbox"
                :options="[{ text: 'Yes', value: true}, { text: 'No', value: false }]"
                buttons
                button-variant="outline-info"
                size="sm"
                name="buttons-2"
                :key="extraKey"
              ></b-form-radio-group>
            </b-form-group>
            </b-list-group-item>
          </b-list-group>
          <b-list-group class="question-panel-info">
            <b-list-group-item
              v-for="(item) in questions"
              v-bind:key="item.question_id"
              class="question-panel-info-item"
            >
            <div
              v-on:click.stop="showQuestionInfo(item)"
            >
              <b-icon icon="pencil"></b-icon>
            </div>
            </b-list-group-item>
          </b-list-group>
        </div>
        </div>
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
    <b-modal id="question-info-modal" centered title="Question Notes">
      <div style="display: flex; flex-direction: column;">
        <b-form-textarea
          id="textarea"
          v-model="questionInfoNotes"
          placeholder="Add some notes..."
          rows="3"
          max-rows="6"
          maxlength="255"
          v-on:blur="notesBlurred()"
        ></b-form-textarea>
      </div>
    </b-modal>
    <b-modal id="starter-question-modal" scrollable centered title="Starter Questions">
      <p> Here are a couple of example questions to help you get moving if you're stuck: </p>
      <li> Am I alive? </li>
      <li> Am I famous? </li>
      <li> Am I a human? </li>
      <li> Am I in the ... industry? </li>
      <li> Am I real? </li>
      <li> Am I male/female? </li>
      <li> Am I old? </li>
    </b-modal>
    <canvas id="confetti-canvas" class="confetti-canvas"></canvas>
    <!-- <FloatButton
      v-if="notYetWon"
      pos="0"
      icon="check"
      navBar
      pulse
      orange
      v-on:float-button-clicked="claimWinConfirm()"
    > </FloatButton> -->
    <!-- <FloatButton
      v-if="!notYetWon && waitingFor.length > 0"
      pos="0.5"
      navBar
      icon="three-dots"
      v-on:float-button-clicked="$bvModal.show('guessing-waiting-on-modal')"
    >
    </FloatButton>
    <b-modal id="guessing-waiting-on-modal" scrollable centered title="Waiting for...">
      <b-list-group>
      <b-list-group-item
        v-for="(name) in waitingFor"
        :key="`waiting-for-${name}`"
      > {{ name }}</b-list-group-item>
    </b-list-group>
    </b-modal> -->
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import Header from '@/components/Header.vue';
import Modal from '@/components/Modal.vue';
import NavBar from '@/components/NavBar.vue';
import ConfettiGenerator from 'confetti-js';
// import FloatButton from '@/components/FloatButton.vue';
import { v4 as uuid } from 'uuid';


export default {
  name: 'PlayArea',
  components: {
    Header,
    Modal,
    // FloatButton,
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
      questionInfo: null,
      questionInfoNotes: '',
      confetti: null,
      newQuestionValue: '',
      newQuestionAnswer: null,
      extraKey: uuid(),
    };
  },
  computed: {
    ...mapGetters([
      'selfHost',
      'players',
      'recommendedOrder',
      'playerId',
      'questionsEnabled',
      'questions',
    ]),
    waitingFor() {
      return this.players.filter((player) => !player.completed_at).map((player) => player.name);
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
      },
      {
        id: 'results',
        label: 'Go to Results',
        variant: 'info',
        onClick: () => this.goToResults(),
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
      'goToResults',
      'updateQuestion',
      'addQuestion',
      'removeQuestion',
      'updateAnswer',
      'updateNotes',
    ]),
    notesBlurred() {
      if (this.questionInfo && this.questionInfoNotes) {
        this.updateNotes({
          questionId: this.questionInfo.question_id,
          notes: this.questionInfoNotes,
        });
      }
    },
    questionBlurred(item) {
      if (item.question) {
        this.updateQuestion({ question: item.question, questionId: item.question_id });
      } else {
        this.removeQuestion({ questionId: item.question_id });
      }
    },
    async newQuestionBlurred() {
      if (this.newQuestionValue) {
        const question = await this.addQuestion({ question: this.newQuestionValue });
        if (question && this.newQuestionAnswer !== null) {
          await this.updateAnswer({
            questionId: question.question_id,
            answer: this.newQuestionAnswer,
          });
          this.newQuestionAnswer = null;
          this.extraKey = uuid();
        }
        this.newQuestionValue = '';
      }
    },
    answerClicked(item, answer) {
      this.updateAnswer({ questionId: item.question_id, answer });
    },
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
    showQuestionInfo(question) {
      this.questionInfo = question;
      this.questionInfoNotes = question.notes;
      this.$bvModal.show('question-info-modal');
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

.overlay{
  width: 100%;
  height: 100%;
  color: $overlay-load;
}

.play-area {
  position: absolute;
  width: 100%;
  height: 100%;

  &-body {
    display: grid;
    width: 100%;
    height: calc(100% - 100px);
    grid-template-rows: auto 50px;

    .question-panel {
      grid-row: 1;
      display: grid;
      grid-template-rows: 40px 60px calc(100vh - 250px);

      &.no-bottom-banner {
        grid-template-rows: 40px 60px calc(100vh - 200px);
      }

      .question-title {
        grid-row: 1;
        align-self: center;
      }

      .starter-questions-button {
        grid-row: 2;
        margin: 10px;
      }

      .no-question-log {
        grid-row: 3;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
      }

      .question-panel-main {
        grid-row: 3;
        grid-template-columns: calc(100% - 150px) 100px 50px;
        display: grid;
        overflow-y: scroll;
        -webkit-mask-image:
          linear-gradient(to bottom, transparent 0%, black 2% 98%, transparent 100%);
        mask-image: linear-gradient(to bottom, transparent 0%, black 2% 98%, transparent 100%);
        padding-bottom: 5px;
        padding-top: 5px;
      }

      &-question {
        margin-left: 10px;
        grid-column: 1;

        :first-child {
          border-top-right-radius: 0px !important;
        }

        :last-child {
          border-bottom-right-radius: 0px !important;
        }

        &-item {
          padding: 5px;
          height: 50px;

          &-text {
            overflow-x: scroll;
            padding-left: 5px;
            padding-right: 5px;
            white-space: nowrap;
            border-style: none;
            -webkit-mask-image: linear-gradient(to right, black 90%, transparent 100%);
            mask-image: linear-gradient(to right, black 90%, transparent 100%);
          }
        }
      }

      &-answer {
        grid-column: 2;

        :first-child {
          border-top-right-radius: 0px !important;
          border-top-left-radius: 0px !important;
        }

        :last-child {
          border-bottom-left-radius: 0px !important;
        }

        :first-child:last-child {
          border-top-right-radius: 0.25rem !important;
        }

        &-item {
          padding: 0px;
          height: 50px;

          &-checkbox {
            padding: 10px;
            height: 50px;

            :first-child {
              border-top-left-radius: 0.25rem !important;
              width: 37px;
            }

            :last-child {
              border-bottom-right-radius: 0.25rem !important;
              width: 37px;
            }
          }
        }
      }

      &-info {
        grid-column: 3;
        margin-right: 10px;

        :first-child {
          border-top-left-radius: 0px !important;
        }

        :last-child {
          border-bottom-left-radius: 0px !important;
        }

        &-item {
          padding-left: 5px;
          padding-right: 5px;
          height: 50px;
        }
      }
    }

    .order-panel {
      grid-row: 1;
      display: grid;
      grid-template-rows: 40px calc(100vh - 190px);

      &.no-bottom-banner {
        grid-template-rows: 40px calc(100vh - 140px);
      }

      .order-title {
        grid-row: 1;
        align-self: center;
      }

      .order-panel-main {
        grid-row: 2;
        overflow-y: scroll;
        -webkit-mask-image:
          linear-gradient(to bottom, transparent 0%, black 2% 98%, transparent 100%);
        mask-image: linear-gradient(to bottom, transparent 0%, black 2% 98%, transparent 100%);
        padding-bottom: 5px;
        padding-top: 5px;
      }

      .order-item {
        display: flex;
        justify-content: space-between;

        &-name {
          flex-grow: 2;
          max-width: 100px;
          overflow-x: scroll;
          white-space: nowrap;
          -webkit-mask-image:
            linear-gradient(to right, transparent 0%, black 10% 90%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 10% 90%, transparent 100%);
        }

        &-value {
          flex-grow: 2;
          max-width: 100px;
          overflow-x: scroll;
          white-space: nowrap;
          -webkit-mask-image:
            linear-gradient(to right, transparent 0%, black 5% 95%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 5% 95%, transparent 100%);
        }
      }
    }

    .lobby-text {
      grid-row: 2;
      display: flex;
      flex-direction: rows;
      justify-content: center;
      align-items: center;
      margin: 5px;
      font-size: 17px;
    }
  }
}
</style>

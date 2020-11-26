import Vue from 'vue';
import axios from 'axios';
import { API_URL } from '@/properties';
import EventBus from '@/event-bus';
import router from '@/router';

async function getGameData({ commit }) {
  try {
    if (!Vue.$cookies.get('secretId') && localStorage.getItem('secretId')) {
      Vue.$cookies.set('secretId', localStorage.getItem('secretId'));
    }
    if (Vue.$cookies.get('secretId')) {
      const req = (await axios.get(`${API_URL}/game`)).data;
      if (!localStorage.getItem('secretId')) {
        localStorage.setItem('secretId', Vue.$cookies.get('secretId'));
      }
      if (req.game) {
        commit('updateGame', req.game);
      }
      if (req.players) {
        commit('updatePlayers', req.players);
      }
      if (req.questions) {
        commit('updateQuestions', req.questions);
      }
      if (req.playerId) {
        commit('updatePlayerId', req.playerId);
      }
    } else if (router.currentRoute.path !== '/') {
      router.push('/');
    }
  } catch (e) {
    if (Vue.$cookies.get('secretId')) {
      EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
      Vue.$cookies.remove('secretId');
    }
    if (localStorage.getItem('secretId')) {
      localStorage.removeItem('secretId');
    }
    if (router.currentRoute.path !== '/') {
      router.push('/');
    }
  }
}

async function joinGame(_, data) {
  try {
    const gameCode = data.gameCode && data.gameCode.toLocaleUpperCase();
    await axios.post(`${API_URL}/game/join`, {
      gameCode,
      name: data.name,
    });
    router.push('/lobby');
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function leaveGame({ commit }) {
  try {
    if (Vue.$cookies.get('secretId')) {
      await axios.post(`${API_URL}/game/leave`);
    }
    if (router.currentRoute.path !== '/') {
      router.push('/');
    }
    commit('clearState');
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function kickPlayer({ state }, playerId) {
  try {
    if (Vue.$cookies.get('secretId')) {
      await axios.post(`${API_URL}/game/kick`, {
        gameId: state.game.game_id,
        playerId,
      });
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function newGame(_, data) {
  try {
    await axios.post(`${API_URL}/game/new?name=${data.name}`);
    router.push('/lobby');
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function restartGame({ state, commit }) {
  try {
    if (Vue.$cookies.get('secretId')) {
      commit('updateGame', {
        ...state.game,
        state: 0,
      });
      await axios.post(`${API_URL}/game/restart`, {
        gameId: state.game.game_id,
      });
      if (router.currentRoute.path !== '/lobby') {
        router.push('/lobby');
      }
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function toggleQuestions({ state }) {
  try {
    if (Vue.$cookies.get('secretId')) {
      await axios.post(`${API_URL}/game/toggle-disable-questions`, {
        gameId: state.game.game_id,
      });
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function startGame({ state }) {
  try {
    if (Vue.$cookies.get('secretId')) {
      await axios.post(`${API_URL}/game/start`, {
        gameId: state.game.game_id,
      });
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function progressGame({ state }) {
  try {
    if (Vue.$cookies.get('secretId')) {
      await axios.post(`${API_URL}/game/progress`, {
        gameId: state.game.game_id,
      });
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function goToResults({ state }) {
  try {
    if (Vue.$cookies.get('secretId')) {
      await axios.post(`${API_URL}/game/results`, {
        gameId: state.game.game_id,
      });
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function submitPostIt(_, data) {
  try {
    if (Vue.$cookies.get('secretId')) {
      await axios.post(`${API_URL}/player/submit-post-it`, {
        playerId: data.playerId,
        postIt: data.postIt,
      });
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function deletePostIt(_, data) {
  try {
    if (Vue.$cookies.get('secretId')) {
      await axios.post(`${API_URL}/player/remove-post-it`, {
        playerId: data.playerId,
      });
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}


async function claimWin() {
  try {
    if (Vue.$cookies.get('secretId')) {
      await axios.post(`${API_URL}/player/claim-win`);
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function addQuestion({ commit }, data) {
  try {
    if (Vue.$cookies.get('secretId')) {
      const [question, questions] = (await axios.post(`${API_URL}/question/new`, {
        question: data.question,
      })).data;
      commit('updateQuestions', questions);
      return question;
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
  return null;
}

async function removeQuestion({ commit }, data) {
  try {
    if (Vue.$cookies.get('secretId')) {
      const questions = (await axios.post(`${API_URL}/question/remove`, {
        questionId: data.questionId,
      })).data;
      commit('updateQuestions', questions);
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function updateQuestion({ commit }, data) {
  try {
    if (Vue.$cookies.get('secretId')) {
      const questions = (await axios.post(`${API_URL}/question/update/question`, {
        questionId: data.questionId,
        question: data.question,
      })).data;
      commit('updateQuestions', questions);
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function updateAnswer({ commit }, data) {
  try {
    if (Vue.$cookies.get('secretId')) {
      const questions = (await axios.post(`${API_URL}/question/update/answer`, {
        questionId: data.questionId,
        answer: data.answer,
      })).data;
      commit('updateQuestions', questions);
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function updateNotes({ commit }, data) {
  try {
    if (Vue.$cookies.get('secretId')) {
      const questions = (await axios.post(`${API_URL}/question/update/notes`, {
        questionId: data.questionId,
        notes: data.notes,
      })).data;
      commit('updateQuestions', questions);
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}


// eslint-disable-next-line
async function wait(time) {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

// eslint-disable-next-line
async function defaultAPI({ commit }, data) {
  try {
    if (Vue.$cookies.get('secretId')) {
      // await axios.post(`${API_URL}/game/start`, {
      //   gameId: state.game.game_id,
      //   secretId: Vue.$cookies.get('secretId'),
      // });
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

export const api = {
  getGameData,
  newGame,
  joinGame,
  leaveGame,
  kickPlayer,
  toggleQuestions,
  startGame,
  progressGame,
  restartGame,
  submitPostIt,
  deletePostIt,
  claimWin,
  goToResults,
  addQuestion,
  removeQuestion,
  updateQuestion,
  updateAnswer,
  updateNotes,
};

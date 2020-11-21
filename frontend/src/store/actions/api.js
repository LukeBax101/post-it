import Vue from 'vue';
import axios from 'axios';
import { API_URL } from '@/properties';
import EventBus from '@/event-bus';
import router from '@/router';

async function getGameData({ commit }) {
  try {
    if (Vue.$cookies.get('secretId')) {
      const req = (await axios.get(`${API_URL}/game/${Vue.$cookies.get('secretId')}`)).data;
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
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
    if (Vue.$cookies.get('secretId')) {
      Vue.$cookies.remove('secretId');
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
      await axios.post(`${API_URL}/game/leave`, {
        secretId: Vue.$cookies.get('secretId'),
      });
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
        secretId: Vue.$cookies.get('secretId'),
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
    await axios.post(`${API_URL}/game/restart`, {
      secretId: Vue.$cookies.get('secretId'),
      gameId: state.game.game_id,
    });
    commit('updateGame', {
      ...state.game,
      state: 0,
    });
    if (router.currentRoute.path !== '/lobby') {
      router.push('/lobby');
    }
  } catch (e) {
    EventBus.$emit('show-alert', { text: `Error: ${e.response.data}` });
  }
}

async function toggleQuestions({ state }) {
  try {
    if (Vue.$cookies.get('secretId')) {
      await axios.post(`${API_URL}/game/toggle-disable-questions`, {
        secretId: Vue.$cookies.get('secretId'),
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
        secretId: Vue.$cookies.get('secretId'),
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
        secretId: Vue.$cookies.get('secretId'),
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
        secretId: Vue.$cookies.get('secretId'),
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
        secretId: Vue.$cookies.get('secretId'),
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
      await axios.post(`${API_URL}/player/claim-win`, {
        secretId: Vue.$cookies.get('secretId'),
      });
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
};

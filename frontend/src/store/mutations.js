// import Vue from 'vue';
import router from '@/router';


export const mutations = {
  updateGame: (state, game) => {
    state.game = game;

    if ((game.state === 0 || game.state === 1) && router.currentRoute.path !== '/lobby') {
      router.push('/lobby');
    }
    if (game.state === 2 && router.currentRoute.path !== '/play-area') {
      router.push('/play-area');
    }
    if (game.state === 3 && router.currentRoute.path !== '/results') {
      router.push('/results');
    }
  },
  updatePlayers: (state, players) => {
    state.players = players;
  },
  updateQuestions: (state, questions) => {
    state.questions = questions;
  },
  updatePlayerId: (state, playerId) => {
    state.playerId = playerId;
  },
  clearState: (state) => {
    state.game = {};
    state.players = [];
    state.questions = [];
    state.playerId = null;
  },
};

/* eslint-disable camelcase */

import Vue from 'vue';
import EventBus from '@/event-bus';
import router from '@/router';

async function socket_gameUpdate({ state, commit }, data) {
  if (Vue.$cookies.get('secretId')) {
    if (state.playerId && data.game.game_id === state.game.game_id) {
      if (data.game) {
        commit('updateGame', data.game);
      }
      if (data.players) {
        const otherPlayers = data.players.filter((player) => player.player_id !== state.playerId);
        const myPlayer = data.players.find((player) => player.player_id === state.playerId);
        if (!myPlayer) {
          EventBus.$emit('show-alert', { text: 'You were kicked from the game by the host!', type: 'warning' });
          commit('clearState');
          if (Vue.$cookies.get('secretId')) {
            Vue.$cookies.remove('secretId');
          }
          if (router.currentRoute.path !== '/') {
            router.push('/');
          }
        }
        if (myPlayer && otherPlayers) {
          let postItName = null;
          if (myPlayer.post_it_name) {
            postItName = (state.game.state !== 3) ? '?' : myPlayer.post_it_name;
          }
          commit('updatePlayers', [
            ...otherPlayers,
            {
              ...myPlayer,
              post_it_name: postItName,
            },
          ]);
        }
      }
    }
  } else if (router.currentRoute.path !== '/') {
    router.push('/');
  }
}

// eslint-disable-next-line
async function wait(time) {
  await new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export const socketio = {
  socket_gameUpdate,
};

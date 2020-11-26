export const getters = {
  game: (state) => state.game,
  players: (state) => [...state.players].sort((a, b) => {
    if (!a.joined_at || !b.joined_at) return 0;
    return new Date(a.joined_at) - new Date(b.joined_at);
  }),
  recommendedOrder: (state) => [...state.players].sort((a, b) => {
    if (a.player_id < b.player_id) return -1;
    if (a.player_id > b.player_id) return 1;
    return 0;
  }),
  playerResults: (state) => [...state.players].sort((a, b) => {
    if (!a.completed_at && b.completed_at) return 1;
    if (!b.completed_at && a.completed_at) return -1;
    if (!a.completed_at && !b.completed_at) return 0;
    return new Date(a.completed_at) - new Date(b.completed_at);
  }),
  playerId: (state) => state.playerId,
  questions: (state) => state.questions.sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0;
    return new Date(a.created_at) - new Date(b.created_at);
  }),
  gameId: (state) => state.game.game_id,
  gameCode: (state) => state.game.game_code,
  gameState: (state) => state.game.state,
  hostId: (state) => state.game.creator_player_id,
  selfHost: (state) => state.game.creator_player_id
    && state.playerId && state.game.creator_player_id === state.playerId,
  questionsEnabled: (state) => !state.game.disable_questions,
};

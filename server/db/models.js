const bookshelf = require('./bookshelf');


const Game = bookshelf.Model.extend({
  tableName: 'games',
  idAttribute: "game_id",
  uuid: true,
  share: function () {
    return this.hasMany('Player').attach(players['player_id']);
  },
},  { dependents: ['player']});

const Player = bookshelf.Model.extend({
  tableName: 'players',
  idAttribute: "player_id",
  uuid: true,
  reading: function () {
    return this.hasMany('Question').attach(questions['question_id']);
  },
}, { dependents: ['question']});

const Question = bookshelf.Model.extend({
  tableName: 'questions',
  idAttribute: "question_id",
  uuid: true,
});

module.exports = { Game, Player, Question };

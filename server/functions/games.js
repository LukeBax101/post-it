const { Game, Player, Question }  = require('../db/models');
const { v4: uuid } = require('uuid');

function genKey() {
  return Array(4).fill(0).map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
}

async function newGame(name) {
    let key = genKey();
    let games = await (await Game.where({ ['game_code']: key }).fetchAll()).toJSON();
    let count = 0;
    while (games.length > 0 && count < 100) {
      key = genKey();
      games = await (await Game.where({ ['game_code']: key }).fetchAll()).toJSON();
      count++;
    }
    if (games.length > 0) {
      throw new Error('Too many games already exist, sorry! Try again in a minute!')
    }
    let created_at = new Date().toISOString();
    const game = (await (await Game.forge({
      game_code: key,
      state: 0,
      created_at,
      disable_questions: false,
    }).save()).toJSON());
    if (name) {
      return await joinGame(game.game_code, name);
    } else {
      return game;
    }
}

async function toggleDisableQuestions(gameId, secretId) {
  if (gameId && secretId) {
    const gameModel = await new Game({ ['game_id']: gameId });
    let game;
    try {
      game = await (await gameModel.fetch()).toJSON();
    } catch (err) {
      throw new Error('No game with that id found');
    }
    if (game.state != 0) {
      throw new Error('Disable questions can only be changed during initial lobby state');
    }
    let owner;
    try {
      owner = await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
    } catch {
      throw new Error('No player with that key found');
    }
    if (owner.player_id == game.creator_player_id) {
      await gameModel.set({ disable_questions: !game.disable_questions });
      return (await (await gameModel.save()).toJSON());
    } else {
      throw new Error('Player must be game creator');
    }
  } else {
    throw new Error('Please provide a gameId and the owner key');
  }
}

async function joinGame(gameCode, name) {
  if (gameCode && name) {
    const gameModel = await new Game({ ['game_code']: gameCode });
    let game;
    try {
      game = await (await gameModel.fetch()).toJSON();
    } catch (err) {
      throw new Error('No game with that code found');
    }
    if (game.state != 0) {
      throw new Error('Game has already started');
    }
    const otherPlayers = await (await Player.where({ ['game_id']: game.game_id }).where({ ['name']: name }).fetchAll()).toJSON();
    if (otherPlayers.length > 0) {
      throw new Error('Player already exists with that name');
    }
    let player = await (await Player.forge({
      secret_id: uuid(),
      game_id: game.game_id,
      name,
      joined_at: new Date().toISOString(),
    }).save()).toJSON();
    if (!game.creator_player_id) {
      await gameModel.set({ ['creator_player_id']: player.player_id });
      game = await (await gameModel.save()).toJSON();
    }
    return {
      game,
      player,
    };
  } else {
    throw new Error('Please provide a name and gameCode')
  }
}

async function leaveGame(secretId) {
  if (secretId) {
    let owner;
    try {
      owner = await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
    } catch {
      throw new Error('No player with that key found');
    }
    const gameModel = await new Game({ ['game_id']: owner.game_id });
    let game;
    try {
      game = await (await gameModel.fetch()).toJSON();
    } catch (err) {
      throw new Error('No game with that id found');
    }
    if (owner.player_id == game.creator_player_id) {
      const players = await (await Player.where({ ['game_id']: owner.game_id }).where('secret_id', '<>', secretId).fetchAll()).toJSON();
      if (players.length == 0) {
        await deleteGame(owner.game_id);
      } else {
        const newHost = players[Math.floor(Math.random() * players.length)];
        await (await gameModel.set({ creator_player_id: newHost.player_id })).save();
        await deletePlayer(owner.player_id);
      }
    } else {
      await deletePlayer(owner.player_id);
    }
    const leftPlayers = await (await Player.where({ ['game_id']: owner.game_id }).fetchAll()).toJSON();
    if (leftPlayers.length == 1) {
      await restartGame(leftPlayers[0].game_id, leftPlayers[0].secret_id);
    }
    return owner.game_id;
  } else {
    throw new Error('Please provide the owner key');
  }
}

async function kickPlayer(gameId, secretId, playerId) {
  if (gameId && secretId && playerId) {
    let owner;
    try {
      owner = await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
    } catch {
      throw new Error('No player with that key found');
    }

    const gameModel = await new Game({ ['game_id']: owner.game_id });
    let game;
    try {
      game = await (await gameModel.fetch()).toJSON();
    } catch (err) {
      throw new Error('No game with that id found');
    }
    if (owner.player_id == game.creator_player_id) {
      let player;
      try {
        player = await (await (await new Player({ ['player_id']: playerId, ['game_id']: gameId })).fetch()).toJSON();
      } catch {
        throw new Error('No player with that id found');
      }
      if (owner.player_id == player.player_id) {
        throw new Error('Cannot kick yourself');
      }
      return leaveGame(player.secret_id);
    } else {
      throw new Error('Must be game host to kick other players');
    }
  } else {
    throw new Error('GameId, playerId and key must all be defined');
  }
}

async function startGame(gameId, secretId) {
  if (gameId && secretId) {
    const gameModel = await new Game({ ['game_id']: gameId });
    let game;
    try {
      game = await (await gameModel.fetch()).toJSON();
    } catch (err) {
      throw new Error('No game with that id found');
    }
    if (game.state == 0) {
      let owner;
      try {
        owner = await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
      } catch {
        throw new Error('No player with that key found');
      }
      const allPlayers = await (await Player.where({ ['game_id']: owner.game_id }).fetchAll()).toJSON();
      if (allPlayers.length < 2) {
        throw new Error('Must be at least two players to start a game');
      }
      if (owner.player_id == game.creator_player_id) {
        await gameModel.set({ state: 1 });
        return (await (await gameModel.save()).toJSON());
      } else {
        throw new Error('Player must be game host');
      }
    } else {
      throw new Error('Game not in initial lobby state');
    }
  } else {
    throw new Error('Please provide a gameId and the owner key');
  }
}

async function progressGame(gameId, secretId) {
  if (gameId && secretId) {
    const gameModel = await new Game({ ['game_id']: gameId });
    let game;
    try {
      game = await (await gameModel.fetch()).toJSON();
    } catch (err) {
      throw new Error('No game with that id found');
    }
    if (game.state == 1) {
      let owner;
      try {
        owner = await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
      } catch {
        throw new Error('No player with that key found');
      }
      if (owner.player_id == game.creator_player_id) {
        await gameModel.set({ state: 2 });
        return (await (await gameModel.save()).toJSON());
      } else {
        throw new Error('Player must be game host');
      }
    } else {
      throw new Error('Game not in lobby state');
    }
  } else {
    throw new Error('Please provide a gameId and the owner key');
  }
}


async function restartGame(gameId, secretId) {
  if (gameId && secretId) {
    const gameModel = await new Game({ ['game_id']: gameId });
    let game;
    try {
      game = await (await gameModel.fetch()).toJSON();
    } catch (err) {
      throw new Error('No game with that id found');
    }
    let owner;
    try {
      owner = await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
    } catch {
      throw new Error('No player with that key found');
    }
    if (owner.player_id == game.creator_player_id) {
      const players = await (await Player.where({ ['game_id']: gameId }).fetchAll()).toJSON();
      await Promise.all(players.map(async (player) => {
        await deletePlayerQuestions(player.player_id);
        const playerModel = await new Player({['player_id']: player.player_id });
        await (await playerModel.set({ giver_player_id: null, ['post_it_name']: null, completed_at: null })).save();
      }));
      return (await (await (await gameModel.set({ state: 0 })).save()).toJSON());
    } else {
      throw new Error('Player must be game host');
    }
  } else {
    throw new Error('Please provide a gameId and the owner key');
  }
}

async function setGameState(gameId, state) {
  if (gameId && state) {
    return await (await (await (await new Game({ ['game_id']: gameId })).set({ state })).save()).toJSON();
  } else {
    throw new Error('GameId and state must be defined');
  }
}

async function getGame(secretId) {
  if (secretId) {
    let owner;
    try {
      owner = await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
    } catch {
      throw new Error('No player with that key found');
    }
    const gameModel = await new Game({ ['game_id']: owner.game_id });
    let game;
    try {
      game = await (await gameModel.fetch()).toJSON();
    } catch (err) {
      throw new Error('No game with that id found');
    }
    const players = await (await Player.where({ ['game_id']: owner.game_id }).where('secret_id', '<>', secretId).fetchAll({ columns: ['player_id', 'name', 'post_it_name', 'giver_player_id', 'completed_at', 'joined_at'] })).toJSON();
    const questions = await (await Question.where({ ['player_id']: owner.player_id }).fetchAll({ columns: ['question_id', 'question', 'answer', 'notes', 'created_at'] })).toJSON();
    let postItName = null;
    if (owner.post_it_name) {
      postItName = (game.state !== 3) ? '?' : owner.post_it_name;
    }
    return {
      game,
      players: [
        ...players,
        {
          player_id: owner.player_id,
          name: owner.name,
          post_it_name: postItName,
          giver_player_id: owner.giver_player_id,
          completed_at: owner.completed_at,
          joined_at: owner.joined_at,
        },
      ],
      questions,
      playerId: owner.player_id,
    };
  } else {
    throw new Error('Please provide a gameId and the players key');
  }
}

async function broadcastGame(io, gameId) {
  if (io && gameId) {
    let game;
    try {
      game = await (await (await new Game({ ['game_id']: gameId })).fetch()).toJSON();
    } catch (err) {
      throw new Error('No game with that id found');
    }
    const players = await (await Player.where({ ['game_id']: gameId }).fetchAll({ columns: ['player_id', 'name', 'post_it_name', 'giver_player_id', 'completed_at', 'joined_at'] })).toJSON();
    io.emit('game_update', { game, players });
  } else {
    throw new Error('GameId and socketIO must be defined');
  }
}

async function deleteGame(gameId) {
  if (gameId) {
    const players = await (await Player.where({ ['game_id']: gameId }).fetchAll()).toJSON();
    await Promise.all(players.map(async (player) => deletePlayer(player.player_id)));
    await Game.where('game_id', gameId).destroy({ require: false });
  } else {
    throw new Error('GameId must be defined');
  }
}

async function deletePlayer(playerId) {
  if (playerId) {
      await deletePlayerQuestions(playerId);
      await deletePlayerLinks(playerId);
      try {
        player = await (await (await new Player({ ['player_id']: playerId })).fetch()).toJSON();
        const gameModel = await new Game({['game_id']: player.game_id });
        const game = await (await gameModel.fetch()).toJSON();
        if (game.creator_player_id == playerId) {
          await (await gameModel.set({ creator_player_id: null })).save();
        }
      } catch (err) {
        console.log(err.message);
      }
      await Player.where('player_id', playerId).destroy({ require: false });
  } else {
    throw new Error('PlayerId must be defined');
  }
}

async function deletePlayerLinks(playerId) {
  if (playerId) {
    let player;
    let playerModel;
    try {
      playerModel = await new Player({ ['giver_player_id']: playerId });
      player = await (await playerModel.fetch()).toJSON();
      await (await playerModel.set({ giver_player_id: null })).save();
    } catch (e) {
      console.log('No links found');
    }
  } else {
    throw new Error('PlayerId must be defined');
  }
}

async function deletePlayerQuestions(playerId) {
  if (playerId) {
    try {
      await Question.where('player_id', playerId).destroy({ require: false });
    } catch (e) {
      console.log(e.message);
    }
  } else {
    throw new Error('PlayerId must be defined');
  }
}

async function cleanDB() {
  console.log(`Cleaning Database at ${new Date().toISOString()}`);
  let cutoff = new Date(new Date() - 86400000).toISOString();
  try {
    const oldGames = await (await Game.where('created_at', '<', cutoff).fetchAll()).toJSON();
    await Promise.all(oldGames.map(async (game) => deleteGame(game.game_id)));
  } catch (e) {
    console.log(e.message);
  }
}

module.exports = {
    newGame,
    joinGame,
    startGame,
    progressGame,
    restartGame,
    getGame,
    leaveGame,
    setGameState,
    kickPlayer,
    toggleDisableQuestions,
    cleanDB,
    broadcastGame,
};

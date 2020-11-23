const { Game, Player, Question }  = require('../db/models');
const { setGameState } = require('../functions/games');

async function submitPostIt(secretId, playerId, postIt) {
  if (secretId && playerId && postIt) {
    let owner;
    try {
      owner = await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
    } catch {
      throw new Error('No player with that key found');
    }
    let game;
    try {
      game = await (await (await new Game({ ['game_id']: owner.game_id })).fetch()).toJSON();
    } catch (err) {
      throw new Error('No game with that id found');
    }
    let player;
    let playerModel;
    try {
      playerModel = await new Player({ ['player_id']: playerId, ['game_id']: owner.game_id });
      player = await (await playerModel.fetch()).toJSON();
    } catch {
      throw new Error('No player with that id found');
    }
    if (owner.player_id == player.player_id) {
      throw new Error('Cannot post-it yourself');
    }
    if (player.post_it_name) {
      throw new Error('Player already has a post-it name');
    }
    const players = await (await Player.where({ ['game_id']: owner.game_id }).fetchAll({ columns: ['player_id', 'giver_player_id'] })).toJSON();
    const playersThatHaveGiven = players.filter(player => !!player.giver_player_id).map(player => player.giver_player_id);
    const playersThatHaveNotGiven = players.map(player => player.player_id).filter(player => !playersThatHaveGiven.includes(player));
    if (!playersThatHaveNotGiven.includes(owner.player_id)) {
      throw new Error('You\'ve aready given a post-it name');
    }
    const postPlayersThatHaveNotGiven = playersThatHaveNotGiven.filter(player => player != owner.player_id);
    const postPlayersThatHaveNotReceived = players.filter(player => !player.post_it_name).map(player => player.player_id).filter(player => player != playerId);
    if (postPlayersThatHaveNotGiven.length == 1 && postPlayersThatHaveNotReceived.length == 1 && postPlayersThatHaveNotGiven[0] == postPlayersThatHaveNotReceived[0]) {
      throw new Error('Can\'t leave one person to post-it themselves')
    }
    player = await (await (await playerModel.set({ ['post_it_name']: postIt, ['giver_player_id']: owner.player_id })).save()).toJSON();
    return {
      game_id: player.game_id,
      player_id: player.player_id,
      post_it_name: player.post_it_name,
    }
  } else {
    throw new Error('Player key, playerId and postIt must be defined');
  }
}

async function removePostIt(secretId, playerId) {
  if (secretId && playerId) {
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
    let player;
    let playerModel;
    try {
      playerModel = await new Player({ ['player_id']: playerId, ['game_id']: owner.game_id });
      player = await (await playerModel.fetch()).toJSON();
    } catch {
      throw new Error('No player with that id found');
    }
    if (owner.player_id == game.creator_player_id || owner.player_id == player.giver_player_id) {
      player = await (await (await playerModel.set({ ['post_it_name']: null, ['giver_player_id']: null })).save()).toJSON();
      return {
        game_id: player.game_id,
        player_id: player.player_id,
        post_it_name: player.post_it_name,
      }
    } else {
      throw new Error('You don\'t have permission to remove that players post-it');
    }
  } else {
    throw new Error('Player id and key must be defined');
  }
}

async function claimWin(secretId) {
  if (secretId) {
    let owner;
    let ownerModel;
    try {
      ownerModel = await new Player({ ['secret_id']: secretId });
      owner = await (await ownerModel.fetch()).toJSON();
    } catch {
      throw new Error('No player with that key found');
    }
    owner = await (await (await ownerModel.set({ completed_at: new Date().toISOString() })).save()).toJSON();
    const players = await (await Player.where({ ['game_id']: owner.game_id }).where('completed_at', null).fetchAll()).toJSON();
    if (players.length == 0) {
      await setGameState(owner.game_id, 3);
    }
    return owner;
  } else {
    throw new Error('Player key must be defined');
  }
}

// async function whoAmI(secretId) {
//   if (secretId) {
//     try {
//       return await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
//     } catch {
//       throw new Error('No player with that key found');
//     }
//   } else {
//     throw new Error('Player key must be defined');
//   }
// }


// async function addMetric(trackId, req) {
//     if (trackId && req && req.name && req.units && req.colour) {
//       let metric = await Metric.forge({
//         track_id: trackId,
//         name: req.name,
//         units: req.units,
//         colour: req.colour,
//         active: true,
//       }).save();
//       return metric.toJSON();
//     } else {
//       throw new Error('Please provide trackId, name, units and colour');
//     }
// }
//
// async function deleteMetric(metricId) {
//     if (metricId) {
//       // const readingDelete = await Reading.where({ ['metric_id']: metricId }).destroy({ require: true});
//       const readingFetch = await Reading.where({ ['metric_id']: metricId }).fetchAll();
//       const readings = readingFetch.toJSON();
//
//       const allReadingDeleted = await Promise.all(readings.map(async (reading) => {
//          const deleted = await Reading.where({ ['reading_id']: reading.reading_id }).destroy({ require: true});
//          return deleted;
//       }));
//
//       const shareFetch = await Share.where({ ['metric_id']: metricId }).fetchAll();
//       const shares = shareFetch.toJSON();
//
//       const allShareDeleted = await Promise.all(shares.map(async (share) => {
//          const deleted = await Share.where({ ['share_id']: share.share_id }).destroy({ require: true});
//          return deleted;
//       }));
//
//       const metricDelete = await Metric.where({ ['metric_id']: metricId }).destroy({ require: true});
//       return 'Successfully deleted metric';
//     } else {
//       throw new Error('Please provide a metricId')
//     }
// }
//
// async function editMetric(metricId, req) {
//   if (metricId && req) {
//     const metricModel = await new Metric({ ['metric_id']: metricId });
//     const metricFetch = await metricModel.fetch();
//     const metric = metricFetch.toJSON();
//     let active;
//     if (req.active === false) {
//       active = false;
//     } else if (req.active === true) {
//       active = true;
//     } else {
//       active = metric.active;
//     }
//     const metricRequest = await metricModel.set({
//       name: req.name || metric.name,
//       units: req.units || metric.units,
//       colour: req.colour || metric.colour,
//       active,
//     });
//     const metricSave = await metricModel.save();
//     return metricSave.toJSON();
//   } else {
//     throw new Error('Please provide a metricId and request body')
//   }
// }
//
// async function getAllReadingData(metricId) {
//   if (metricId) {
//     const readingFetch = await Reading.where({ ['metric_id']: metricId }).fetchAll({ columns: ['reading_id', 'value', 'read_at'] });
//     return readingFetch.toJSON();
//   } else {
//     throw new Error('Please provide a metricId')
//   }
// }
//
module.exports = {
    submitPostIt,
    removePostIt,
    claimWin,
};
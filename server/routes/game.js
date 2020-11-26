const express = require('express');
const { newGame, joinGame, startGame, progressGame, goToResults, restartGame, getGame, leaveGame, kickPlayer, toggleDisableQuestions, broadcastGame } = require('../functions/games');
const router = express.Router();


router.post('/new', async (req, res) => {
  try {
      const game = await newGame(req.query && req.query.name);
      if (game.game) {
        broadcastGame(req.socketio, game.game_id);
      }
      if (game.player) {
        res.cookie('secretId', game.player.secret_id, {
          httpOnly: false,
          signed: false,
          secure: req.app.get('env') === 'production',
        });
      }
      res.json(game);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/join', async (req, res) => {
  try {
       const join = await joinGame(req.body.gameCode, req.body.name);
       broadcastGame(req.socketio, join.game.game_id);
       res.cookie('secretId', join.player.secret_id, {
         httpOnly: false,
         signed: false,
         secure: req.app.get('env') === 'production',
       });
       res.json(join);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/start', async (req, res) => {
  try {
       const start = await startGame(req.body.gameId, req.body.secretId);
       broadcastGame(req.socketio, start.game_id);
       res.json(start);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/progress', async (req, res) => {
  try {
       const progress = await progressGame(req.body.gameId, req.body.secretId);
       broadcastGame(req.socketio, progress.game_id);
       res.json(progress);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/results', async (req, res) => {
  try {
       const results = await goToResults(req.body.gameId, req.body.secretId);
       broadcastGame(req.socketio, results.game_id);
       res.json(results);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/restart', async (req, res) => {
  try {
       const restart = await restartGame(req.body.gameId, req.body.secretId);
       broadcastGame(req.socketio, restart.game_id);
       res.json(restart);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/leave', async (req, res) => {
  try {
       const leave = await leaveGame(req.body.secretId);
       req.socketio.emit('leave', 'im leavign');
       broadcastGame(req.socketio, leave);
       res.clearCookie('secretId');
       res.json(leave);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/kick', async (req, res) => {
  try {
       const kick = await kickPlayer(req.body.gameId, req.body.secretId, req.body.playerId);
       broadcastGame(req.socketio, kick);
       res.json(kick);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/toggle-disable-questions', async (req, res) => {
  try {
       const toggle = await toggleDisableQuestions(req.body.gameId, req.body.secretId);
       broadcastGame(req.socketio, toggle.game_id);
       res.json(toggle);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.get('/:secretId', async (req, res) => {
  try {
       const gameInfo = await getGame(req.params.secretId);
       res.json(gameInfo);
    } catch (e) {
      res.clearCookie('secretId');
      res.status(400).send(e.message);
    }
});

module.exports = router;

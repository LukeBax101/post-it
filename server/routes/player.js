const express = require('express');
const { submitPostIt, removePostIt, claimWin } = require('../functions/players');
const { broadcastGame } = require('../functions/games');
const router = express.Router();

router.post('/submit-post-it', async (req, res) => {
  try {
       const add = await submitPostIt(req.body.secretId, req.body.playerId, req.body.postIt);
       broadcastGame(req.socketio, add.game_id);
       res.json(add);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/remove-post-it', async (req, res) => {
  try {
       const remove = await removePostIt(req.body.secretId, req.body.playerId);
       broadcastGame(req.socketio, remove.game_id);
       res.json(remove);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/claim-win', async (req, res) => {
  try {
       const win = await claimWin(req.body.secretId);
       broadcastGame(req.socketio, win.game_id);
       res.json(win);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

module.exports = router;

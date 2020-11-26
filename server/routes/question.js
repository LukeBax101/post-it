const express = require('express');
const {addQuestion, updateQuestion, updateAnswer, updateNotes, removeQuestion} = require('../functions/questions');
const bcrypt = require('bcrypt');

const router = express.Router();

router.post('/new', async (req, res) => {
  try {
       const add = await addQuestion(req.cookies.secretId, req.body.question);
       res.json(add);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/remove', async (req, res) => {
  try {
       const remove = await removeQuestion(req.cookies.secretId, req.body.questionId);
       res.json(remove);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/update/question', async (req, res) => {
  try {
       const update = await updateQuestion(req.cookies.secretId, req.body.questionId, req.body.question);
       res.json(update);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/update/answer', async (req, res) => {
  try {
       const update = await updateAnswer(req.cookies.secretId, req.body.questionId, req.body.answer);
       res.json(update);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

router.post('/update/notes', async (req, res) => {
  try {
       const update = await updateNotes(req.cookies.secretId, req.body.questionId, req.body.notes);
       res.json(update);
    } catch (e) {
      res.status(400).send(e.message);
    }
});

module.exports = router;

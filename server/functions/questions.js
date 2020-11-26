const { Game, Player, Question }  = require('../db/models');

async function addQuestion(secretId, question) {
  if (secretId && question) {
    let owner;
    try {
      owner = await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
    } catch {
      throw new Error('No player with that key found');
    }
    let questionObj = await (await Question.forge({
      player_id: owner.player_id,
      question,
      created_at: new Date().toISOString(),
    }).save()).toJSON();
    const questions = await (await Question.where({ ['player_id']: owner.player_id }).fetchAll({ columns: ['question_id', 'question', 'answer', 'notes', 'created_at'] })).toJSON();
    return [questionObj, questions];
  } else {
    throw new Error('Player key and question must be defined');
  }
}

async function updateQuestion(secretId, questionId, newQuestion) {
  if (secretId && questionId && newQuestion) {
    let owner;
    try {
      owner = await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
    } catch {
      throw new Error('No player with that key found');
    }
    let question;
    let questionModel;
    try {
      questionModel = await new Question({ ['question_id']: questionId })
      question = await (await questionModel.fetch()).toJSON();
    } catch {
      throw new Error('No question with that id found');
    }
    if (owner.player_id === question.player_id) {
      question = await (await (await questionModel.set({ ['question']:  newQuestion })).save()).toJSON();
    } else {
      throw new Error('You must be the question creator to edit it');
    }
    return await (await Question.where({ ['player_id']: owner.player_id }).fetchAll({ columns: ['question_id', 'question', 'answer', 'notes', 'created_at'] })).toJSON();
  } else {
    throw new Error('Player key, questionId and question must be defined');
  }
}

async function updateAnswer(secretId, questionId, answer) {
  if (secretId && questionId) {
    let owner;
    try {
      owner = await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
    } catch {
      throw new Error('No player with that key found');
    }
    let question;
    let questionModel;
    try {
      questionModel = await new Question({ ['question_id']: questionId })
      question = await (await questionModel.fetch()).toJSON();
    } catch {
      throw new Error('No question with that id found');
    }
    if (owner.player_id === question.player_id) {
      question = await (await (await questionModel.set({ ['answer']: answer })).save()).toJSON();
    } else {
      throw new Error('You must be the question creator to edit it');
    }
    return await (await Question.where({ ['player_id']: owner.player_id }).fetchAll({ columns: ['question_id', 'question', 'answer', 'notes', 'created_at'] })).toJSON();
  } else {
    throw new Error('Player key and questionId must be defined');
  }
}

async function updateNotes(secretId, questionId, notes) {
  if (secretId && questionId && notes) {
    let owner;
    try {
      owner = await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
    } catch {
      throw new Error('No player with that key found');
    }
    let question;
    let questionModel;
    try {
      questionModel = await new Question({ ['question_id']: questionId })
      question = await (await questionModel.fetch()).toJSON();
    } catch {
      throw new Error('No question with that id found');
    }
    if (owner.player_id === question.player_id) {
      question = await (await (await questionModel.set({ ['notes']: notes })).save()).toJSON();
    } else {
      throw new Error('You must be the question creator to edit it');
    }
    return await (await Question.where({ ['player_id']: owner.player_id }).fetchAll({ columns: ['question_id', 'question', 'answer', 'notes', 'created_at'] })).toJSON();
  } else {
    throw new Error('Player key, questionId and notes must be defined');
  }
}

async function removeQuestion(secretId, questionId) {
  if (secretId && questionId) {
    let owner;
    try {
      owner = await (await (await new Player({ ['secret_id']: secretId })).fetch()).toJSON();
    } catch {
      throw new Error('No player with that key found');
    }
    let question;
    let questionModel;
    try {
      questionModel = await new Question({ ['question_id']: questionId })
      question = await (await questionModel.fetch()).toJSON();
    } catch {
      throw new Error('No question with that id found');
    }
    if (owner.player_id === question.player_id) {
      await Question.where('question_id', questionId).destroy({ require: false });
    } else {
      throw new Error('You must be the question creator to edit it');
    }
    return await (await Question.where({ ['player_id']: owner.player_id }).fetchAll({ columns: ['question_id', 'question', 'answer', 'notes', 'created_at'] })).toJSON();
  } else {
    throw new Error('Player key and questionId must be defined');
  }
}

module.exports = {
  addQuestion,
  updateQuestion,
  updateAnswer,
  updateNotes,
  removeQuestion,
};

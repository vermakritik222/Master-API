const express = require('express');
const todoController = require('../../../controllers/apps/todo/todoController');
const todoCommentController = require('../../../controllers/apps/todo/todoCommentController');

const router = express.Router();

router.route('/').get(todoController.getTodo).post(todoController.createTodo);

router
    .route('/:id')
    .patch(todoController.updateTodo)
    .delete(todoController.deleteTodo);

router
    .route('/comment')
    .get(todoCommentController.getAllComment)
    .post(todoCommentController.createComment);

router
    .route('/comment/:id')
    .patch(todoCommentController.updateComment)
    .delete(todoCommentController.deleteComment);

module.exports = router;

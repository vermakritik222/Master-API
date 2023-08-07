const Todo = require('../../../models/apps/todo/todoModel');
const handlerFactory = require('../../../services/handlerFactoryService');

exports.createTodo = handlerFactory.createOne(Todo);

exports.getTodo = handlerFactory.getAll(Todo);
// TODO: add the user id doc
// exports.getTodo = handlerFactory.getAllForUser(Todo);

exports.updateTodo = handlerFactory.updateOne(Todo);

exports.deleteTodo = handlerFactory.delete(Todo);

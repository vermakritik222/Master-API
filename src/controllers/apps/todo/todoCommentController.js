const Comment = require('../../../models/apps/todo/commentModel');
const handlerFactory = require('../../../services/handlerFactoryService');
const catchAsync = require('../../../utils/chtchasync');

// TODO: add the user id doc
exports.getAllComment =handlerFactory.getAll(Comment)

exports.createComment = handlerFactory.createOne(Comment);

exports.getOneComment = handlerFactory.getOne(Comment);

exports.updateComment = handlerFactory.updateOne(Comment);

exports.deleteComment = handlerFactory.delete(Comment);

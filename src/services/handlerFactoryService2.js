const catchAsync = require('../utils/chtchasync');

exports.find = async (Model, filters) => {
    const doc = await Model.findOne(filters);
    return doc;
};

exports.createOne = async (Model, data) => {
    const doc = await Model.create(data);
    return doc;
};

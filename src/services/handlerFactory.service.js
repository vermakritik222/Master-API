const APIFeatures = require('../utils/apiFeatures');

exports.getAll = async (Model, query) => {
    const features = new APIFeatures(Model.find(), query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const doc = await features.query;
    return doc;
};

exports.find = async (Model, filters) => {
    const doc = await Model.findOne(filters);
    return doc;
};

exports.findMany = async (Model, filters) => {
    const doc = await Model.find(filters);
    return doc;
};

exports.createOne = async (Model, data) => {
    const doc = await Model.create(data);
    return doc;
};

exports.updateOne = async (Model, filters, data) => {
    const doc = await Model.updateOne(filters, data);
    return doc;
};

exports.findById = async (Model, id) => {
    const doc = await Model.findById(id);
    return doc;
};

exports.deleteOne = async (Model, id) => {
    const doc = await Model.findByIdAndDelete(id);
    return doc;
};

exports.deleteMany = async (Model, query) => {
    const doc = await Model.deleteMany(query);
    return doc;
};

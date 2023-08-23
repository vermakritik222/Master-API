const handlerFactoryService = require('../../../services/handlerFactoryService2');
const RoomModel = require('../../../models/apps/voiceChat/room.model');

exports.create = async (req, res) => {
    // room
    const { topic, roomType } = req.body;

    if (!topic || !roomType) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    const room = await handlerFactoryService.createOne(RoomModel, {
        topic,
        roomType,
        ownerId: req.user._id,
        speakers: [req.user._id],
    });

    return res.json(room);
};

exports.index = async (req, res) => {
    const rooms = await RoomModel.find({ roomType: { $in: ['open'] } })
        .populate('speakers')
        .populate('ownerId')
        .exec();
    return res.json(rooms);
};

exports.show = async (req, res) => {
    const room = await handlerFactoryService.find(RoomModel, {
        _id: req.params.roomId,
    });

    return res.json(room);
};

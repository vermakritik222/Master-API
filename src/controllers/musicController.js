const fs = require('fs');
const path = require('path');
const { streamFileChunks } = require('../services/musicService');
const { promisify } = require('util');

const fileInfo = promisify(fs.stat);

exports.streamSong = async (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', '..', '.', 'public', filename);
    
    const { size } = await fileInfo(filePath);
    const range = req.headers.range;

    if (range) {
        let [start, end] = range.replace(/bytes=/, '').split('-');
        start = parseInt(start, 10);
        end = end ? parseInt(end, 10) : size - 1;

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': start - end + 1,
            'Content-Type': 'audio/mpeg',
        });

        const readStream = fs.createReadStream(filePath, { start, end });
        streamFileChunks(readStream, res);
    } else {
        res.writeHead(200, {
            'Content-Length': size,
            'Content-Type': 'audio/mpeg',
        });
        const readStream = fs.createReadStream(filePath).pipe(res);
        streamFileChunks(readStream, res);
    }
};

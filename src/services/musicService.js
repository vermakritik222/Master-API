const fs = require('fs');

exports.streamFileChunks = (readStream, res) => {
    let isPreloading = true;
    const preloadBuffer = []; // Buffer to hold preloaded chunks
    const preloadChunkSize = 10; // Number of chunks to preload

    readStream.on('data', (chunk) => {
        // Send the first chunk immediately without preloading
        if (isPreloading) {
            isPreloading = false;
            res.write(chunk);
        } else {
            // Add the chunk to the preload buffer
            preloadBuffer.push(chunk);

            // Pause the stream after preloading a few chunks
            if (preloadBuffer.length >= preloadChunkSize) {
                readStream.pause();

                // Send the preloaded chunks to the client
                preloadBuffer.forEach((preloadChunk) => {
                    res.write(preloadChunk);
                });

                preloadBuffer.length = 0; // Clear the preload buffer

                // Resume reading after a short delay to continue buffering
                setTimeout(() => {
                    readStream.resume();
                }, 100);
            }
        }
    });
    
    readStream.on('error', (error) => {
        console.error('Error while streaming audio:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    });
};

exports.streamFileNormally = (readStream, res) => {
    // Pipe the read stream to the response stream
    readStream.pipe(res);

    // Handle errors
    readStream.on('error', (error) => {
        console.error('Error while streaming audio:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    });
};

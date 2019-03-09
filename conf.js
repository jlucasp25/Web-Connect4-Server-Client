module.exports.port = 8156;
module.exports.mediaTypes = {
    'txt':      'text/plain',
    'html':     'text/html',
    'css':      'text/css',
    'js':       'application/javascript',
    'png':      'image/png',
    'jpeg':     'image/jpeg',
    'jpg':      'image/jpeg',
}
module.exports.headers = {
    'plain': {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Request-Method': '*'          
    },
    'sse': {    
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Connection': 'keep-alive',
        'Access-Control-Request-Method': '*'
    }
};
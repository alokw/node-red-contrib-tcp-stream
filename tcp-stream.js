module.exports = function(RED) {

    function tcpStreamNode(config) {

        var net = require('net');
        RED.nodes.createNode(this,config);
        this.port = parseInt(config.port);
        this.host = config.host;
        this.delimiter = config.delimiter;
        this.status( {fill:"red",shape:"ring",text:"connecting..."} );
        var node = this;


        try {
            
            var client = new net.createConnection({ host: node.host, port: node.port })
                
                client.on('connect', function() {
                    msg = {}
                    msg.payload = 'connected to ' + String(node.host) + ' on port ' + String(node.port)
                    node.send( [null, msg] );
                    node.status({fill:"green",shape:"dot",text:"connected"});
                })

                client.on('error', function(err) {
                    
                    if (err.code == "ENOTFOUND") {
                        console.log("error: not found");
                        node.warn("error: not found")
                        node.status( {fill:"red",shape:"ring",text:"not found"} );
                        client.destroy();
                        return;
                    } else if (err.code == "ECONNREFUSED") {
                        console.log("error: connection refused");
                        node.warn("error: connection refused")
                        node.status( {fill:"red",shape:"ring",text:"refused"} );
                        client.destroy();
                        return;
                    } else if (err.code == "ETIMEDOUT") {
                        console.log("error: connection timeout");
                        node.warn("error: connection timeout")
                        node.status( {fill:"red",shape:"ring",text:"timeout"} );
                        client.destroy();
                        return;
                    } else {
                        console.log("error: " + err.code);
                        node.warn("error: " + err.code)
                        node.status( {fill:"red",shape:"ring",text:"error"} );
                        client.destroy();
                        return;
                    }
                })

                client.on('data', function(data) {
                    msg = {};
                    msg.payload = {};

                    let header = node.delimiter;
                    var receivebuffer = data;
                    var delimiter_length = header.length;

                    if (receivebuffer.toString('utf8',0,delimiter_length) == header) {

                        var receivebufferarray = receivebuffer.toString().split(node.delimiter);
                        for(var j = 1; j < receivebufferarray.length;j++){
                            try {
                                var rcv_cmd = JSON.parse(receivebufferarray[j].substr(delimiter_length).toString());
                                msg.payload.response = rcv_cmd;
                                msg.payload.host = node.host
                                msg.payload.port = node.port
                                node.send( [null, msg] );

                            } catch(err) {
                                console.log(err);
                            }
                        }
                    }

                });

                node.on('input', function(msg) {
                    // expect a buffer
                    const buff = msg.payload

                    // setup return info
                    ret = {}
                    ret.payload = {}
                    ret.payload.request = buff
                    ret.payload.host = node.host
                    ret.payload.port = node.port
                    
                    // return stuff accordingly
                    client.write(buff);
                    node.send( [ret, null] );

                })


        } catch(err) {
            console.log("connection failed: " + err);
        }

    }

    RED.nodes.registerType("tcp-stream",tcpStreamNode);

}

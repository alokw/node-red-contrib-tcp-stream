module.exports = function(RED) {

    function tcpStreamNode(config) {

        var net = require('net');
        RED.nodes.createNode(this,config);
        this.port = parseInt(config.port);
        this.host = config.host;
        this.delimiter = config.delimiter;
        var node = this;

        var client = net.createConnection({ host: node.host, port: node.port }, () => {
            msg = {}
            msg.payload = 'connected to ' + String(node.host) + ' on port ' + String(node.port)
            node.send( [null, msg] );
            this.status({fill:"green",shape:"dot",text:"connected"});
        });


        node.on('input', function(msg) {

            // append delimiter and remove spaces
            json = msg.payload + node.delimiter
            json_spaceless = json.replace(/^\s+|\s+$/g, '');
            msg.payload = json_spaceless

            // convert to buffer
            const buff = Buffer.from(msg.payload, "utf-8");

            // setup return info
            ret = {}
            ret.payload = {}
            ret.payload.request = buff
            ret.payload.host = node.host
            ret.payload.port = node.port
            ret.payload.length = json_spaceless.length;
            
            // return stuff accordingly
            client.write(buff);
            node.send( [ret, null] );

        });

        client.on('data', (data) => {
            msg = {};
            msg.payload = {};
            response_delimited = data.toString();
            response = response_delimited.replace(/0xPX/, '');
            msg.payload.response = JSON.parse(response);
            msg.payload.host = node.host
            msg.payload.port = node.port
            node.send( [null, msg] );
        });

        client.on('end', () => {
            msg = {}
            msg.payload = 'disconnected from ' + String(node.host) + ' on port ' + String(node.port)
            node.send( [null, msg] );
            this.status( {fill:"red",shape:"ring",text:"disconnected"} );
        }); 

    }

    RED.nodes.registerType("tcp-stream",tcpStreamNode);

}
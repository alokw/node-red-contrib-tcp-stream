# node-red-contrib-tcp-stream
This a very simple node based on the node.js net package that opens a TCP connection and startup and keeps it open until it has been disconnected.
There is little error checking, and was developed for a specific use case, so feel free to use, but proceed to use with caution.

## Installation
npm install node-red-contrib-tcp-stream

## Configuration
Host: Specifies the hostname / IP address of which to connect to.
Port: Specifies the destination port to connect on.
Delimiter: Optional Parameter that will add the specified delimiter at the end of any requests sent through the node.

## Use
Input: Payloads sent into the node will be passed on via the TCP connection
Output1: Used for confirmation / debugging - will return the input payload with the specified delimiter, along with the host address and port.
Output2: Returns any responses from the host, along with its address and port.
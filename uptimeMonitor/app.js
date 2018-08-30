/*
	Primary file for the API
*/

'use strict';

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

// The server should respond to all requests with a string
const server = http.createServer((req, res) => {

	// Get the URL and parse it
	const parsedUrl = url.parse(req.url, true);

	// Get the path
	const path = parsedUrl.pathname;
	const trimmedPath = path.replace(/^\/+|\/+$/g, '');


	// Get the query string as an object
	const queryStringObject = parsedUrl.query;

	// Get the HTTP method
	const method = req.method.toLowerCase();

	// Get the headers as an object
	const headers = req.headers;

	// Get the payload, if any
	const decoder = new StringDecoder('utf-8');
	let buffer = '';

	req.on('data', data => {
		buffer += decoder.write(data);
	});
	// Send the response
	req.on('end', () => {
		buffer += decoder.end();
		res.end("Hello, World" + '\n');
		console.log('Request received with this payload: ', buffer);
	})

	// Log the request headers
});

server.listen(3000, () => {
	console.log("The server is listening on port 3000 now");
});
function handleError(res, headers, message) {
	// console.log(res);
	res.writeHead(404, headers);
	res.write(JSON.stringify({
		status: 'fail',
		message
	}));
	res.end()
}

module.exports = handleError;
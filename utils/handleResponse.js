module.exports = {
	handleResponse(res, headers, data) {
		res.writeHead(200, headers);
		res.write(JSON.stringify({
			status: 'success',
			data
		}));
		res.end()
	},
	handleError(res, headers, statusCode, message) {
		// console.log(res);
		res.writeHead(statusCode, headers);
		res.write(JSON.stringify({
			status: statusCode === 500 ? 'error' : 'failed',
			message
		}));
		res.end()
	}
};
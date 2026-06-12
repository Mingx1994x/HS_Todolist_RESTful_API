const http = require('http');
const { v4: uuidv4 } = require('uuid');

const { handleResponse, handleError } = require('./utils/handleResponse');

const todos = [];

const serverRequest = (req, res) => {
	const headers = {
		'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
		'Access-Control-Allow-Origin': '*',
		'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
		'Content-Type': 'application/json'
	}
	let body = '';
	req.on('data', chunk => body += chunk);

	if (req.url === '/todos' && req.method === 'GET') {
		// get todos
		handleResponse(res, headers, todos)
	} else if (req.url === '/todos' && req.method === 'POST') {
		// create todo
		req.on('end', () => {
			try {
				const content = JSON.parse(body).content;
				if (content) {
					const newTodo = {
						content,
						id: uuidv4()
					}
					todos.push(newTodo);
					handleResponse(res, headers, todos)
				} else {
					const errMessage = '欄位未填寫正確';
					handleError(res, headers, 400, errMessage)
				}
			} catch (error) {
				let errMessage = '資料有誤，請洽客服人員';
				handleError(res, headers, 500, errMessage);
			}
		})
	} else if (req.url === '/todos' && req.method === 'DELETE') {
		// delete todos
		todos.length = 0;
		handleResponse(res, headers, todos);
	} else if (req.url.startsWith('/todos/') && req.method === 'DELETE') {
		// delete todo by Id
		const deleteItem = req.url.split('/').pop();
		const deleteIndex = todos.findIndex(todo => todo.id === deleteItem);
		if (deleteIndex !== -1) {
			todos.splice(deleteIndex, 1);
			handleResponse(res, headers, todos)
		} else {
			const errMessage = '查無此 id';
			handleError(res, headers, 404, errMessage);
		}
	} else if (req.url.startsWith('/todos/') && req.method === 'PATCH') {
		// update todo 
		req.on('end', () => {
			try {
				const updateId = req.url.split('/').pop();
				const updateIndex = todos.findIndex(todo => todo.id === updateId);
				const newTodo = JSON.parse(body).content;
				if (updateIndex === -1) {
					const errMessage = '查無此id';
					handleError(res, headers, 404, errMessage);
				} else if (!newTodo) {
					const errMessage = '欄位未填寫正確';
					handleError(res, headers, 400, errMessage)

				} else {
					todos[updateIndex].content = newTodo;
					handleResponse(res, headers, todos);
				}
			} catch (error) {
				const errMessage = '伺服器發生錯誤';
				handleError(res, headers, 500, errMessage);

			}
		})
	} else if (req.method === 'OPTIONS') {
		res.writeHead(200, headers);
		res.end()
	} else {
		const errMessage = 'page not found';
		handleError(res, headers, 404, errMessage);
	}
}
const server = http.createServer(serverRequest);
server.listen(process.env.port || 3005);
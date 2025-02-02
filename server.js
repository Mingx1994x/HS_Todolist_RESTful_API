const http = require('http');
const { v4: uuidv4 } = require('uuid');

const handleError = require('./handleError');

const todos = [];

//read todos
const getTodos = (res, headers) => {
	res.writeHead(200, headers);
	res.write(JSON.stringify({
		status: 'success',
		data: todos
	}));
	res.end()
}

//create todos
const createTodos = (res, headers, body) => {
	let content = JSON.parse(body).content;
	if (content) {
		let newTodo = {
			content,
			id: uuidv4()
		}
		todos.push(newTodo);

		res.writeHead(200, headers);
		res.write(JSON.stringify({
			status: 'success',
			data: todos
		}));
		res.end()
	} else {
		let errMessage = '欄位未填寫正確';
		handleError(res, headers, errMessage);
	}
}

//delete todos
const deleteTodos = (res, headers) => {
	res.writeHead(200, headers);
	todos.length = 0;
	res.write(JSON.stringify({
		status: 'success',
		data: todos
	}));
	res.end()
}

//delete single todo
const deleteTodoById = (res, headers, index) => {
	res.writeHead(200, headers);
	todos.splice(index, 1);
	res.write(JSON.stringify({
		status: 'success',
		data: todos
	}));
	res.end();
}

// update todo
const updateTodoById = (res, headers, body, index) => {
	let newTodo = JSON.parse(body).content;
	if (newTodo) {
		todos[index].content = newTodo;
		res.writeHead(200, headers);
		res.write(JSON.stringify({
			status: 'update success',
			data: todos
		}));
		res.end()
	} else {
		let errMessage = '欄位未填寫正確';
		handleError(res, headers, errMessage);
	}
}

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
		getTodos(res, headers);
	} else if (req.url === '/todos' && req.method === 'POST') {
		req.on('end', () => {
			try {
				// console.log(JSON.parse(body).content);
				createTodos(res, headers, body);
			} catch (error) {
				let errMessage = '資料有誤，請洽客服人員';
				handleError(res, headers, errMessage);
			}
		})
	} else if (req.url === '/todos' && req.method === 'DELETE') {
		deleteTodos(res, headers);
	} else if (req.url.startsWith('/todos/') && req.method === 'DELETE') {
		let deleteItem = req.url.split('/').pop();
		let deleteIndex = todos.findIndex(todo => todo.id === deleteItem);
		// console.log(deleteIndex);
		if (deleteIndex === -1) {
			let errMessage = '查無此id';
			handleError(res, headers, errMessage);
		} else {
			deleteTodoById(res, headers, deleteIndex);
		}
	} else if (req.url.startsWith('/todos/') && req.method === 'PATCH') {
		req.on('end', () => {
			try {
				let updateItem = req.url.split('/').pop();
				// console.log(JSON.stringify(body), updateItem);
				let updateIndex = todos.findIndex(todo => todo.id === updateItem);
				if (updateIndex === -1) {
					let errMessage = '查無此id';
					handleError(res, headers, errMessage);
				} else {
					updateTodoById(res, headers, body, updateIndex);
				}
			} catch (error) {
				let errMessage = '資料有誤，請洽客服人員';
				handleError(res, headers, errMessage);
			}
		})
	} else if (req.method === 'OPTIONS') {
		res.writeHead(200, headers);
		res.end()
	} else {
		let errMessage = 'page not found';
		handleError(res, headers, errMessage);
	}
}
const server = http.createServer(serverRequest);
server.listen(process.env.port || 3005);
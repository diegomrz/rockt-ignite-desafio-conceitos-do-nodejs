const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);
  if(!user){
    return response.status(400).json({error: 'User does not exists!'});
  }
  request.username = user;
  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;
  const userAlreadyExists = users.some(
    (user) => user.username === username)

  if(userAlreadyExists)
    return response.status(400).json({error: 'User already exists!'})

  users.push({
    id: uuidv4(),
    todos: [{}],
    username,
    name
  });

  return response.status(201).send();
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  console.log(user);console.log(user);console.log(user);console.log(user);
  
  const todo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  
  user.push(todo);

  return response.status(200).json(users);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  console.log(user);console.log(user);console.log(user);console.log(user);
  
  const todo = user.todos.find(todo => todo.id === id);
  if(!todo){ return response.status(400).json({error: "Todo doesn't exists"})}
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);
  
  if(!todo){ 
    return response.status(404).json({error: "Todo doesn't exists"})
  }
  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todosIndex = user.todos.findIndex(todo => todo.id === id);
  
  if(!todosIndex < 0){ 
    return response.status(400).json({error: "Todo doesn't exists"})
  }

  user.todos.splice(todosIndex, 1)

  return response.status(204).send();
});

module.exports = app;
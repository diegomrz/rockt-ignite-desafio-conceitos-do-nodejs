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
    return response.status(404).json({error: 'User does not exists!'});
  }
  request.user = user;
  
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username)

  if(userAlreadyExists)
    return response.status(400).json({error: 'User already exists!'})

  const user = ({
    id: uuidv4(),
    username,
    name,
    todos: []
  });

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
    
  const todo = {
    id: uuidv4(),
    title: title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  
  user.todos.push(todo);

  return response.status(200).json(users);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  
  const todo = user.todos
    .find(todo => todo.id === id);
  
    if(!todo){ 
      return response.status(400).json({error: "Todo doesn't exists"
    })}
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

  user.todos.push(todo);

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
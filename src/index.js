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
  request.user = user;
  
  return next();
}

function checksAlreadyExistsUserAccount(request, response, next) {
  const { username } = request.body;
  
  const user = users.find(user => user.username === username);
  
  if(user){
    return response.status(400).json({error: 'User already exists!'})
  }
  request.user = user;
  
  return next();
}

app.post('/users', checksAlreadyExistsUserAccount, (request, response) => {
  const { name, username } = request.body; //recebe via json

  const user = ({
    id: uuidv4(),
    name,
    username,
    todos: [],
  });

  users.push(user); // Envia dados recebidos à lista users

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request; 
  /* Importante entender aqui que o middleware 
  já fez o trabalho de carregar o usuário e os todos
  ao verificar se o usuário existe! */
  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
    
  const todo = {
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  }
  
  user.todos.push(todo);

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;
  
  const todo = user.todos
  .find(todo => todo.id === id);
  /* O método find, busca dentro da lista de ToDos
  dentro o usuário recebido a partir do middleware 
  aquele que tiver o mesmo id passado por parâmetro*/

  if(!todo){ 
    return response.status(404).json({error: "Todo not found"
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
  
  if(todosIndex === -1){ 
    return response.status(404).json({error: "Todo doesn't exists"})
  }

  user.todos.splice(todosIndex, 1)

  return response.status(204).json([]);
});

module.exports = app;
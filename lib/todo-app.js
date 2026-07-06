var initial_model = {
  todos: [],
  hash: "#/"
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    model: initial_model,
    update: update
  };
}

function update(action, model, data) {
  var new_model = JSON.parse(JSON.stringify(model));
  
  switch(action) {
    case 'ADD':
      new_model.todos.push({
        id: model.todos.length + 1,
        title: data,
        done: false
      });
      break;
      
    case 'TOGGLE':
      new_model.todos.forEach(function(todo) {
        if (todo.id === data) {
          todo.done = !todo.done;
        }
      });
      break;
      
    case 'DELETE':
      new_model.todos = new_model.todos.filter(function(todo) {
        return todo.id !== data;
      });
      break;
      
    case 'TOGGLE_ALL':
      var allDone = new_model.todos.every(function(todo) {
        return todo.done;
      });
      new_model.todos.forEach(function(todo) {
        todo.done = !allDone;
      });
      break;
      
    case 'CLEAR_COMPLETED':
      new_model.todos = new_model.todos.filter(function(todo) {
        return !todo.done;
      });
      break;
      
    case 'ROUTE':
      new_model.hash = data;
      break;
      
    default:
      return model;
  }
  
  return new_model;
}
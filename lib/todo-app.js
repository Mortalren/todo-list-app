var initial_model = {
  todos: [],
  hash: "#/"
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    model: initial_model,
    update: update,
     view: view,
     render_item: render_item,
     render_main: render_main,
     render_footer: render_footer,
     subscriptions: subscriptions
  };
}

function update(action, model, data) {
    console.log('update called:', action, data);
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
  console.log('new_model:', new_model);
  return new_model;
}

function render_item(item, signal) {
  return li([
    "data-id=" + item.id,
    "id=" + item.id,
    item.done ? "class=completed" : ""
  ], [
    div(["class=view"], [
      input([
        "class=toggle",
        "type=checkbox",
        item.done ? "checked=true" : "",
        signal('TOGGLE', item.id)
      ], []),
      label([], [text(item.title)]),
      button([
        "class=destroy",
        signal('DELETE', item.id)
      ])
    ])
  ]);
}

function render_main(model, signal) {
  var filteredTodos = model.todos;
  
  if (model.hash === '#/active') {
    filteredTodos = model.todos.filter(function(todo) {
      return !todo.done;
    });
  } else if (model.hash === '#/completed') {
    filteredTodos = model.todos.filter(function(todo) {
      return todo.done;
    });
  }
  
  var allDone = model.todos.every(function(todo) {
    return todo.done;
  });
  
  return section([
    model.todos.length === 0 ? "style=display:none" : "style=display:block"
  ], [
    input([
      "class=toggle-all",
      "id=toggle-all",
      "type=checkbox",
      allDone ? "checked=true" : "",
      signal('TOGGLE_ALL')
    ], []),
    label(["for=toggle-all"], [text("Mark all as complete")]),
    ul(["class=todo-list"], filteredTodos.map(function(item) {
            return render_item(item, signal);
    }))

  ]);
}

function render_footer(model, signal) {
  var activeCount = model.todos.filter(function(todo) {
    return !todo.done;
  }).length;
  
  var completedCount = model.todos.filter(function(todo) {
    return todo.done;
  }).length;
  
  return footer([
    model.todos.length === 0 ? "style=display:none" : "style=display:block"
  ], [
    span(["class=todo-count"], [
      strong([], [text(String(activeCount))]),
      text(" " + (activeCount === 1 ? "item" : "items") + " left")
    ]),
    ul(["class=filters"], [
      li([], [
        a([
          "href=#/",
          model.hash === '#/' ? "class=selected" : ""
        ], [text("All")])
      ]),
      li([], [
        a([
          "href=#/active",
          model.hash === '#/active' ? "class=selected" : ""
        ], [text("Active")])
      ]),
      li([], [
        a([
          "href=#/completed",
          model.hash === '#/completed' ? "class=selected" : ""
        ], [text("Completed")])
      ])
    ]),
    button([
      "class=clear-completed",
      completedCount === 0 ? "style=display:none" : "style=display:block",
      signal('CLEAR_COMPLETED')
    ], [text("Clear completed")])
  ]);
}

function view(model, signal) {
  return section(["class=todoapp"], [
        header(["class=header"], [
        h1([], [text("todos")]),
        input([
            "id=new-todo",
            "class=new-todo",
            "placeholder=What needs to be done?",
            "autofocus=true"
        ], [])
        ]),
    render_main(model, signal),
    render_footer(model, signal)
  ]);
}

function subscriptions(signal) {
var ENTER_KEY = 13;
  var ESCAPE_KEY = 27;

  document.addEventListener('keyup', function handler (e) {
    switch(e.keyCode) {
      case ENTER_KEY:
        var editing = document.getElementsByClassName('editing');
        if (editing && editing.length > 0) {
          signal('SAVE')();
        }

        var new_todo = document.getElementById('new-todo');
        var text = new_todo.value.trim();
        if (text.length > 0) {
          signal('ADD', text)();
          new_todo.value = '';
          document.getElementById('new-todo').focus();
        }
        break;
      case ESCAPE_KEY:
        signal('CANCEL')();
        break;
    }
  });

  window.onhashchange = function route () {
    signal('ROUTE', window.location.hash)();
  };
}

window.model = initial_model;
window.update = update;
window.view = view;
window.subscriptions = subscriptions;
import { 
  a, button, div, footer, input, h1, header, label, li, mount, section, span, select,
option, strong, text, ul 
} from './elmish.js';

export const initial_model = {
  todos: [],
  hash: "#/"
};

export function update(action, model, data) {
    console.log('update called:', action, data);
  var new_model = JSON.parse(JSON.stringify(model));
  
  switch(action) {
    case 'ADD':
      new_model.todos.push({
        id: crypto.randomUUID(),
        title: data.title,
        priority: data.priority,
        done: false,
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

export function render_item(item, signal) {
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
      label([], [text(item.title + " [" + item.priority + "]")]),
      button([
        "class=destroy",
        signal('DELETE', item.id)
      ])
    ])
  ]);
}

export function render_main(model, signal) {
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
    "class=main",
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

export function render_footer(model, signal) {
  var activeCount = model.todos.filter(function(todo) {
    return !todo.done;
  }).length;
  
  var completedCount = model.todos.filter(function(todo) {
    return todo.done;
  }).length;
  
  return footer([
    "class=footer",
    model.todos.length === 0 ? "style=display:none" : "style=display:block"
  ], [
    span(["class=todo-count"], [
      strong(activeCount.toString()),
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

export function view(model, signal) {
  return div([], [
        header(["class=header"], [
        h1([], [text("todos")]),
        input([
            "id=new-todo",
            "class=new-todo",
            "placeholder=What needs to be done?",
            "autofocus=true"
        ], []),
        select([
            "id=priority"
        ], [
            option(["value=Low"], [text("Low")]),
            option(["value=Medium", "selected"], [text("Medium")]),
            option(["value=High"], [text("High")])
        ])
        ]),
    render_main(model, signal),
    render_footer(model, signal)
  ]);
}

export function subscriptions(signal) {
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
        var priority = document.getElementById("priority").value;
        if (text.length > 0) {
          signal('ADD', {
            title: text,
            priority: priority
        })();
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

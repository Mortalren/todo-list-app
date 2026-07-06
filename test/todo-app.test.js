const test = require('tape');       
const fs = require('fs');          
const path = require('path');       
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'));
require('jsdom-global')(html);      
const app = require('../lib/todo-app.js');
const id = 'test-app';              

test("Initial model should be empty", function (t) {

    t.deepEqual(app.model, {
        todos: [],
        hash: "#/"
    });

    t.end();
});

test('ADD a new todo item', function (t) {
  const model = JSON.parse(JSON.stringify(app.model));
  const updatedModel = app.update('ADD', model, 'Купить молоко');
  
  t.equal(updatedModel.todos.length, 1, 'В списке 1 задача');
  t.equal(updatedModel.todos[0].title, 'Купить молоко', 'Название задачи правильное');
  t.equal(updatedModel.todos[0].done, false, 'Статус задачи - не выполнена');
  t.end();
});
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

test('TOGGLE changes todo status', function (t) {
  const model = app.update('ADD', app.model, 'Task');
  const id = model.todos[0].id;

  const updated = app.update('TOGGLE', model, id);

  t.equal(updated.todos[0].done, true, 'Todo marked as completed');
  t.end();
});

test('DELETE removes todo', function (t) {
  const model = app.update('ADD', app.model, 'Task');
  const id = model.todos[0].id;

  const updated = app.update('DELETE', model, id);

  t.equal(updated.todos.length, 0, 'Todo removed');
  t.end();
});

test('CLEAR_COMPLETED removes completed todos', function (t) {
  let model = app.update('ADD', app.model, 'Task');
  const id = model.todos[0].id;

  model = app.update('TOGGLE', model, id);
  model = app.update('CLEAR_COMPLETED', model);

  t.equal(model.todos.length, 0, 'Completed todos removed');
  t.end();
});

test('ROUTE updates hash', function (t) {
  const updated = app.update('ROUTE', app.model, '#/completed');

  t.equal(updated.hash, '#/completed', 'Hash updated');
  t.end();
});

test('Unknown action returns original model', function (t) {
  const updated = app.update('UNKNOWN', app.model);

  t.deepEqual(updated, app.model);
  t.end();
});
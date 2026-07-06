import test from 'tape';       
import fs from 'fs';         
import path from 'path';      
import { fileURLToPath } from 'url';
import jsdomGlobal from 'jsdom-global';        

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
jsdomGlobal(html);

import { 
  initial_model, 
  update, 
  view, 
  render_item, 
  render_main, 
  render_footer, 
  subscriptions 
} from '../lib/todo-app.js';

const id = 'test-app';

test("Initial model should be empty", function (t) {

    t.deepEqual(initial_model, {
        todos: [],
        hash: "#/"
    });

    t.end();
});

test('ADD a new todo item', function (t) {
  const model = JSON.parse(JSON.stringify(initial_model));
  const updatedModel = update('ADD', model, 'Купить молоко');
  
  t.equal(updatedModel.todos.length, 1, 'В списке 1 задача');
  t.equal(updatedModel.todos[0].title, 'Купить молоко', 'Название задачи правильное');
  t.equal(updatedModel.todos[0].done, false, 'Статус задачи - не выполнена');
  t.end();
});

test('TOGGLE changes todo status', function (t) {
  const model = update('ADD', initial_model, 'Task');
  const id = model.todos[0].id;

  const updated = update('TOGGLE', model, id);

  t.equal(updated.todos[0].done, true, 'Todo marked as completed');
  t.end();
});

test('DELETE removes todo', function (t) {
  const model = update('ADD', initial_model, 'Task');
  const id = model.todos[0].id;

  const updated = update('DELETE', model, id);

  t.equal(updated.todos.length, 0, 'Todo removed');
  t.end();
});

test('CLEAR_COMPLETED removes completed todos', function (t) {
  let model = update('ADD', initial_model, 'Task');
  const id = model.todos[0].id;

  model = update('TOGGLE', model, id);
  model = update('CLEAR_COMPLETED', model);

  t.equal(model.todos.length, 0, 'Completed todos removed');
  t.end();
});

test('ROUTE updates hash', function (t) {
  const updated = update('ROUTE', initial_model, '#/completed');

  t.equal(updated.hash, '#/completed', 'Hash updated');
  t.end();
});

test('Unknown action returns original model', function (t) {
  const updated = update('UNKNOWN', initial_model);

  t.deepEqual(updated, initial_model);
  t.end();
});
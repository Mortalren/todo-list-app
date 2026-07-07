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

test('ADD a new todo item', async function (t) {
  const model = JSON.parse(JSON.stringify(initial_model));
  const updatedModel = await update('ADD', model, {
    title: 'Купить молоко',
    priority: 'Medium',
    deadline: '2026-07-10'
});
  
  t.equal(updatedModel.todos.length, 1, 'В списке 1 задача');
  t.equal(updatedModel.todos[0].title, 'Купить молоко', 'Название задачи правильное');
  t.equal(updatedModel.todos[0].done, false, 'Статус задачи - не выполнена');
  t.end();
});

test('TOGGLE changes todo status', async function (t) {
  const model = await update('ADD', initial_model, { title: 'Task',
        priority: 'Medium'
    });

  const id = model.todos[0].id;
  const updated = await update('TOGGLE', model, id);

  t.equal(updated.todos[0].done, true, 'Todo marked as completed');
  t.end();
});

test('DELETE removes todo', async function (t) {
  const model = await update('ADD', initial_model, {
        title: 'Task',
        priority: 'Medium'
    });

  const id = model.todos[0].id;
  const updated = await update('DELETE', model, id);

  t.equal(updated.todos.length, 0, 'Todo removed');
  t.end();
});

test('CLEAR_COMPLETED removes completed todos', async function (t) {
  let model = await update('ADD', initial_model, {
        title: 'Task',
        priority: 'Medium'
    });
    
  const id = model.todos[0].id;

  model = await update('TOGGLE', model, id);
  model = await update('CLEAR_COMPLETED', model);

  t.equal(model.todos.length, 0, 'Completed todos removed');
  t.end();
});

test('ROUTE updates hash', async function (t) {
  const updated = await update('ROUTE', initial_model, '#/completed');

  t.equal(updated.hash, '#/completed', 'Hash updated');
  t.end();
});

test('Unknown action returns original model', async function (t) {
  const updated = await update('UNKNOWN', initial_model);

  t.deepEqual(updated, initial_model);
  t.end();
});

test('render_item creates correct DOM structure', function (t) {
    const item = {
        id: 1,
        title: 'Test Task',
        done: false,
        priority: 'High',
        deadline: '2026-07-10'
    };
    const signal = (action, data) => () => {};

    const element = render_item(item, signal);

    t.equal(element.tagName, 'LI', 'Creates li element');
    t.equal(element.getAttribute('data-id'), '1', 'data-id attribute set');
    t.equal(element.id, '1', 'id attribute set');
    t.notEqual(element.querySelector('.view'), null, 'Contains view div');
    t.notEqual(element.querySelector('.toggle'), null, 'Contains toggle input');
    t.notEqual(element.querySelector('.destroy'), null, 'Contains destroy button');
    t.end();
});

test('render_item marks completed items', function (t) {
    const item = {
        id: 1,
        title: 'Test Task',
        done: true,
        priority: 'Low',
        deadline: ''
    };

    const signal = (action, data) => () => {};
    const element = render_item(item, signal);

    t.true(element.classList.contains('completed'), 'Has completed class');
    const toggle = element.querySelector('.toggle');
    t.equal(toggle.getAttribute('checked'), 'true', 'Checkbox is checked');
    t.end();
});

test('render_main shows main section with todos', function (t) {
    const model = {
        todos: [
            { id: 1, title: 'Task 1', done: false, priority: 'Medium', deadline: '' },
            { id: 2, title: 'Task 2', done: true, priority: 'Low', deadline: '' }
        ],
        hash: '#/'
    };

    const signal = (action, data) => () => {};
    const element = render_main(model, signal);

    t.equal(element.tagName, 'SECTION', 'Creates section');
    t.equal(element.id, 'main', 'Has main id');
    t.notEqual(element.querySelector('.todo-list'), null, 'Contains todo list');
    const items = element.querySelectorAll('.todo-list li');
    t.equal(items.length, 2, 'Renders 2 todo items');
    t.end();
});

test('render_main filters active todos', function (t) {
    const model = {
        todos: [
            { id: 1, title: 'Task 1', done: false, priority: 'Medium', deadline: '' },
            { id: 2, title: 'Task 2', done: true, priority: 'Low', deadline: '' }
        ],
        hash: '#/active'
    };

    const signal = (action, data) => () => {};
    const element = render_main(model, signal);

    const items = element.querySelectorAll('.todo-list li');
    t.equal(items.length, 1, 'Shows only active todos');
    t.equal(items[0].id, '1', 'Correct todo shown');
    t.end();
});

test('render_main filters completed todos', function (t) {
    const model = {
        todos: [
            { id: 1, title: 'Task 1', done: false, priority: 'Medium', deadline: '' },
            { id: 2, title: 'Task 2', done: true, priority: 'Low', deadline: '' }
        ],
        hash: '#/completed'
    };

    const signal = (action, data) => () => {};
    const element = render_main(model, signal);

    const items = element.querySelectorAll('.todo-list li');
    t.equal(items.length, 1, 'Shows only completed todos');
    t.equal(items[0].id, '2', 'Correct todo shown');
    t.end();
});

test('render_main hides when no todos', function (t) {
    const model = {
        todos: [],
        hash: '#/'
    };

    const signal = (action, data) => () => {};
    const element = render_main(model, signal);

    const display = element.getAttribute('style');
    t.equal(display, 'display:none', 'Main section hidden');
    t.end();
});

test('render_footer shows correct count', function (t) {
    const model = {
        todos: [
            { id: 1, title: 'Task 1', done: false, priority: 'Medium', deadline: '' },
            { id: 2, title: 'Task 2', done: false, priority: 'Low', deadline: '' },
            { id: 3, title: 'Task 3', done: true, priority: 'High', deadline: '' }
        ],
        hash: '#/'
    };

    const signal = (action, data) => () => {};
    const element = render_footer(model, signal);

    const count = element.querySelector('.todo-count strong');
    t.equal(count.textContent, '2', 'Shows 2 items left');
    t.end();
});

test('render_footer shows filters', function (t) {
    const model = {
        todos: [],
        hash: '#/'
    };

    const signal = (action, data) => () => {};
    const element = render_footer(model, signal);

    const filters = element.querySelectorAll('.filters a');
    t.equal(filters.length, 3, 'Shows 3 filters');
    t.equal(filters[0].textContent, 'All', 'All filter');
    t.equal(filters[1].textContent, 'Active', 'Active filter');
    t.equal(filters[2].textContent, 'Completed', 'Completed filter');
    t.end();
});

test('render_footer shows clear completed button when completed exist', function (t) {
    const model = {
        todos: [
            { id: 1, title: 'Task 1', done: true, priority: 'Medium', deadline: '' },
            { id: 2, title: 'Task 2', done: false, priority: 'Low', deadline: '' }
        ],
        hash: '#/'
    };

    const signal = (action, data) => () => {};
    const element = render_footer(model, signal);

    const clearBtn = element.querySelector('.clear-completed');
    const display = clearBtn.getAttribute('style');
    t.ok(display.includes('block'), 'Clear button visible');
    t.end();
});

test('render_footer hides clear completed button when none completed', function (t) {
    const model = {
        todos: [
            { id: 1, title: 'Task 1', done: false, priority: 'Medium', deadline: '' },
            { id: 2, title: 'Task 2', done: false, priority: 'Low', deadline: '' }
        ],
        hash: '#/'
    };

    const signal = (action, data) => () => {};
    const element = render_footer(model, signal);

    const clearBtn = element.querySelector('.clear-completed');
    const display = clearBtn.getAttribute('style');
    t.ok(display.includes('none'), 'Clear button hidden');
    t.end();
});

test('render_footer hides footer when no todos', function (t) {
    const model = {
        todos: [],
        hash: '#/'
    };

    const signal = (action, data) => () => {};
    const element = render_footer(model, signal);

    const display = element.getAttribute('style');
    t.equal(display, 'display:none', 'Footer hidden');
    t.end();
});

import VRuntime2Factory from "./prototype2.js";

const VRuntime2 = new VRuntime2Factory();
const Atom2 = VRuntime2.atomFactory();
const Computed2 = VRuntime2.computedFactory();

const todoState2 = new Atom2({
  todos: []
});

class TodoApp2 {
  
  computed =  [];
  
  render() {
    const container = document.createElement('div');
    let todosContainer = (new TodoContainer2([])).render();
    container.append((new TodoInput2()).render())
    container.append(todosContainer);
    this.computed.push(new Computed2(() => {
      const newTodo = (new TodoContainer2(todoState2.get().todos)).render();
      todosContainer.replaceWith(newTodo);
      todosContainer = newTodo;
    }, false));
    
    this.el = container;
    return this.el;
  }
  
}

class TodoInput2 {
  
  render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <input type="text" id="td-inpt2">
        <button id="td-add2">Добавить</button>
    `;
    self.inpt = container.querySelector('#td-inpt2');
    self.btn = container.querySelector('#td-add2');
    self.btn.onclick = () => TodoInput2.click();
    return container;
  }
  
  static click() {
    let currentState = todoState2.get();
    currentState.todos = [...(currentState.todos ?? []), {name: self.inpt.value, checked: false, id: Math.floor(Math.random() * 100000000)}];
    self.inpt.value = null;
    todoState2.set(currentState);
  }
}

class TodoContainer2 {
  
  constructor(todos) {
    this.todos = todos;
  }
  
  render() {
    const container = document.createElement('div');
    
    for (let todo of this.todos) {
      container.append((new Todo2(todo.name, todo.isChecked, todo.id)).render());
    }
    
    return container;
  }
  
}

class Todo2 {
  
  constructor(name, isChecked, id) {
    this.name = name;
    this.isChecked = isChecked;
    this.id = id;
  }
  
  render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <div style="display: flex; gap: 1rem">
            <input type="checkbox" ${this.isChecked ? 'checked' : ''}>
            <span>${this.name}</span>
            <button class="todo-dlt2">X</button>
        </div>
    `;
    container.querySelector('.todo-dlt2').onclick = () => Todo2.remove(this.id);
    return container;
  }
  
  static remove(id) {
    const state = todoState2.get();
    state.todos = state.todos.filter(todo => todo.id !== id);
    todoState2.set(state);
  }
  
}

let app2 = new TodoApp2();

document.getElementById('app2').append(app2.render());

let vc2 = new Computed2(function() {
  return todoState2.get().todos.length + 1;
});

let bt2 = new Computed2(function () {
  return vc2.get() + 1;
});

new Computed2(() => {
  document.getElementById('counter2').innerHTML = bt2.get();
}, false);

let tasksCount2 = new Computed2(() => todoState2.get().todos.length);

document.getElementById('cnt-btn2').onclick = () => alert(tasksCount2.get());

const test2 = new Atom2([{a: 123}, {a: 256}]);

const testC2 = new Computed2(() => {
  let t = test2.get();
  let gp = test2.get();
  return t.length + gp.length;
});

console.log('d');
const todoState = new Atom({
  todos: []
});

class TodoApp {
  
  computed =  [];
  
  render() {
    const container = document.createElement('div');
    let todosContainer = (new TodoContainer([])).render();
    container.append((new TodoInput()).render())
    container.append(todosContainer);
    this.computed.push(new Computed(() => {
      const newTodo = (new TodoContainer(todoState.get().todos)).render();
      todosContainer.replaceWith(newTodo);
      todosContainer = newTodo;
    }, false));
    
    this.el = container;
    return this.el;
  }
  
}

class TodoInput {
  
  render() {
    const container = document.createElement('div');
    container.innerHTML = `
        <input type="text" id="td-inpt">
        <button id="td-add" onclick="TodoInput.click()">Добавить</button>
    `;
    self.inpt = container.querySelector('#td-inpt');
    self.btn = container.querySelector('#td-add');
    return container;
  }
  
  static click() {
    let currentState = todoState.get();
    currentState.todos = [...(currentState.todos ?? []), {name: self.inpt.value, checked: false, id: Math.floor(Math.random() * 100000000)}];
    self.inpt.value = null;
    todoState.set(currentState);
  }
}

class TodoContainer {
  
  constructor(todos) {
    this.todos = todos;
  }
  
  render() {
    const container = document.createElement('div');
    
    for (let todo of this.todos) {
      container.append((new Todo(todo.name, todo.isChecked, todo.id)).render());
    }
    
    return container;
  }
  
}

class Todo {
  
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
            <button class="todo-dlt" onclick="Todo.remove(${this.id})">X</button>
        </div>
    `;
    return container;
  }
  
  static remove(id) {
    const state = todoState.get();
    state.todos = state.todos.filter(todo => todo.id !== id);
    todoState.set(state);
  }
  
}

let app = new TodoApp();

document.getElementById('app').append(app.render());

let vc = new Computed(function() {
  return todoState.get().todos.length + 1;
});

let bt = new Computed(function () {
  return vc.get() + 1;
});

new Computed(() => {
  document.getElementById('counter').innerHTML = bt.get();
}, false);

let tasksCount = new Computed(() => todoState.get().todos.length);

document.getElementById('cnt-btn').onclick = () => alert(tasksCount.get());
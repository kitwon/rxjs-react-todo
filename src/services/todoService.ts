import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { map, scan, publishReplay, refCount, tap, switchMap } from 'rxjs/operators';
import Todo from '../models/todoModel';

type ListTodo = (todos: Todo[]) => Todo[];

const CACHE_KEY = 'react-todos';
let initialTodos: Todo[];
try {
  initialTodos = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
} catch (err) {
  initialTodos = [];
}

class TodoService {
  // Main stream
  todos$: Observable<Todo[]>
  createTodo$ = new Subject<Todo>()

  // Local control stream
  update$ = new BehaviorSubject<ListTodo>((todos: Todo[]) => todos)

  constructor() {
    // Add todo
    // Crete add stream
    this.createTodo$
      .pipe(
        map(todo => (todos: Todo[]) => {
          const t = todos.find(i => i.id === todo.id)
          if (!t) return todos.concat(todo)

          return todos
        })
      )
      .subscribe(this.update$);

    // Async to server
    this.createTodo$
      .pipe(
        switchMap(todo => this.createTodoSync(todo)),
        map(todo => (todos: Todo[]) => {
          return todos.map(i => {
            if (i.id === todo.id) return todo
            return i
          })
        })
      )
      .subscribe(this.update$) 

    // Cache
    this.todos$ = this.update$
       .pipe(
         scan<ListTodo, Todo[]>((todos, operation) => operation(todos), initialTodos),
         tap(todos => localStorage.setItem(CACHE_KEY, JSON.stringify(todos))),
         publishReplay(1),
         refCount()
       );
  }

  public add(todo: string | Todo): void {
    const value = typeof todo === 'string' ? new Todo(todo) : todo 
    this.createTodo$.next(value);
  }

  /**
   * 新建Todo
   *
   * @param {Todo} todo
   * @returns {Observable<Todo>} Todo stream
   * @memberof TodoService
   */
  public createTodoSync(todo: Todo) {
    return ajax({
      url: '/api/todo',
      method: 'POST',
      body: todo,
      headers: {'content-type': 'application/json'} }
    ).pipe(
      map(res => res.response.data as Todo)
    )
  }
}

export default new TodoService();

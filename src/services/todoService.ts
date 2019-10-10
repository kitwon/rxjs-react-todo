import { BehaviorSubject, Subject, Observable, of } from 'rxjs';
import { ajax, AjaxRequest } from 'rxjs/ajax';
import { map, scan, publishReplay, refCount, tap, switchMap, catchError, retryWhen, delay } from 'rxjs/operators';
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
  toggle$ = new Subject<string>()
  delete$ = new Subject<string>()
  modify$ = new Subject<Todo>()
  removeComplete$ = new Subject()

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
        switchMap(todo => this.createTodoRemote(todo)),
        map(todo => (todos: Todo[]) => {
          const index = todos.findIndex(i => i.id === todo.id)
          todos.splice(index, 1, todo)
          return todos
        })
      )
      .subscribe(this.update$) 

    // Change todo status
    this.toggle$
      .pipe(
        map(uuid => (todos: Todo[]) => {
          const target = todos.find(todo => todo.id === uuid);
          if (target) target.completed = !target.completed;
          return todos;
        })
      )
      .subscribe(this.update$);

    // Delete todo
    this.delete$
      .pipe(map(uuid => (todos: Todo[]) => todos.filter(t => t.id !== uuid)))
      .subscribe(this.update$);

    // Modify todo
    this.modify$
      .pipe(
        map(({ id, title }) => (todos: Todo[]) => {
          const todo = todos.find(i => i.id === id);
          if (todo) todo.title = title;
          return todos;
        })
      )
      .subscribe(this.update$);
    
    this.removeComplete$
      .pipe(map(() => (todos: Todo[]) => todos.filter(i => !i.completed)))
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

  public toggle(uuid: string): void {
    this.toggle$.next(uuid);
  }

  public delete(uuid: string): void {
    this.delete$.next(uuid);
  }

  public modify(uuid: string, title: string): void {
    this.modify$.next({ id: uuid, title })
  }

  public removeComplete(): void {
    this.removeComplete$.next()
  }

  private request$(options: AjaxRequest) {
    return ajax({
      method: 'GET',
      ...options,
      headers: { 'content-type': 'application/json' ,...options.headers }
    }).pipe(
      retryWhen(err => err.pipe(
        delay(1000),
        scan((acc) => {
          if (acc >= 2) throw new Error('Retry limit exceeded!')
          return acc + 1
        }, 0)
      ))
    )
  }

  /**
   * 新建Todo
   *
   * @param {Todo} todo
   * @returns {Observable<Todo>} Todo stream
   * @memberof TodoService
   */
  public createTodoRemote(todo: Todo) {
    return this.request$({ url: '/api/todo', method: 'POST', body: todo })
      .pipe(
        map(res => res.response.data as Todo),
        catchError(() => of({ ...todo, message: '新建Todo失败' } as Todo))
      )
  }
}

export default new TodoService();

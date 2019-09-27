import { BehaviorSubject, Subject, Observable, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
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
  // create$: Observable<ListTodo>
  toggle$ = new Subject<string>()
  delete$ = new Subject<string>()
  modify$ = new Subject<Todo>()
  removeComplete$ = new Subject()

  constructor() {
    // Create Stream
    this.createTodo$
      .pipe(
        map(todo => (todos: Todo[]) => {
          let t = todos.find(i => i.id === todo.id)
          if (t) t = todo
          if (!t) return todos.concat(todo)
          return todos
        }),
      )
      .subscribe(this.update$);

    this.createTodo$
      .pipe(
        switchMap(todo => this.postTodo(todo)),
        map(todo => (todos: Todo[]) => {
          const t = todos.find(i => i.id === todo.id)
          if (t && t.message) delete t.message
          if (t && todo.message) t.message = todo.message
          return todos
        })
      )
      .subscribe(this.update$) 

    this.toggle$
      .pipe(
        map(uuid => (todos: Todo[]) => {
          const target = todos.find(todo => todo.id === uuid);
          if (target) target.completed = !target.completed;
          return todos;
        })
      )
      .subscribe(this.update$);

    this.delete$
      .pipe(map(uuid => (todos: Todo[]) => todos.filter(t => t.id !== uuid)))
      .subscribe(this.update$);

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

    // Init Main Stream
    // this.createTodo$.subscribe(this.create$)

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

  public postTodo(todo: Todo) {
    return ajax.post('/api/todo', todo, { 'content-type': 'application/json' })
      .pipe(
        retryWhen(err => err.pipe(
          delay(1000),
          scan((acc) => {
            if (acc >= 2) throw new Error('Retry limit exceeded!')
            return acc + 1
          }, 0)
        )),
        map(res => res.response.data as Todo),
        catchError(() => of({ ...todo, message: '新建Todo失败' } as Todo))
      )
  }
}

export default new TodoService();

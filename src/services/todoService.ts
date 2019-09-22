import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { map, scan, publishReplay, refCount, tap } from 'rxjs/operators';
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
  update$ = new BehaviorSubject<ListTodo>((todos: Todo[]) => todos)
  create$ = new Subject<Todo>()
  toggle$ = new Subject<string>()
  delete$ = new Subject<string>()
  modify$ = new Subject<Todo>()
  removeComplete$ = new Subject()

  constructor() {
    this.create$.pipe(map(todo => (todos: Todo[]) => todos.concat(todo))).subscribe(this.update$);

    this.toggle$
      .pipe(
        map(uuid => (todos: Todo[]) => {
          const target = todos.find(todo => todo.id === uuid);
          if (target) target.completed = !target.completed;
          return todos;
        })
      )
      .subscribe(this.update$);

    this.delete$.pipe(map(uuid => (todos: Todo[]) => todos.filter(t => t.id !== uuid))).subscribe(this.update$);

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
        .pipe(
          map(() => (todos: Todo[]) => todos.filter(i => !i.completed))
        )
        .subscribe(this.update$)

    this.todos$ = this.update$.pipe(
      scan<ListTodo, Todo[]>((todos, operation) => operation(todos), initialTodos),
      tap(todos => localStorage.setItem(CACHE_KEY, JSON.stringify(todos))),
      publishReplay(1),
      refCount()
    );
  }

  public add(title: string): void {
    this.create$.next(new Todo(title));
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
}

export default new TodoService();

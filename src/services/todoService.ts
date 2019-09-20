import { BehaviorSubject, Subject, Observable } from 'rxjs'
import { map, scan, publishReplay, refCount } from 'rxjs/operators'
import Todo from '../models/todoModel'

type ListTodo = (todos: Todo[]) => Todo[]

class TodoService {
  // Main stream
  todos$: Observable<Todo[]>
  update$ = new BehaviorSubject<ListTodo>((todos: Todo[]) => todos)
  create$ = new Subject<Todo>()
  toggle$ = new Subject<string>()

  constructor() {
    this.create$.pipe(
        map(todo => (todos: Todo[]) => todos.concat(todo))
      )
      .subscribe(this.update$)

    this.toggle$
      .pipe(
        map(uuid => (todos: Todo[]) => {
          const target = todos.find(todo => todo.id === uuid)
          if (target) target.completed = !target.completed
          return todos
        })
      )
      .subscribe(this.update$)

    this.todos$ = this.update$
      .pipe(
        scan<ListTodo, Todo[]>((todos, operation) => operation(todos), []),
        publishReplay(1),
        refCount()
      )
  }

  public add(title: string): void {
    this.create$.next(new Todo(title))
  }

  public toggle(uuid: string): void {
    this.toggle$.next(uuid)
  }
}

export default new TodoService()
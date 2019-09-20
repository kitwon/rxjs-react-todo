import React, { FunctionComponent } from 'react'
import Todo from '../models/todoModel'
import TodoItem from './TodoItem';

interface ListProps {
  todos: Todo[]
  toggleTodo: (id: string) => void
}

const TodoList: FunctionComponent<ListProps> = (props: ListProps) => {
  return (
    <section className="main">
      <input type="checkbox" className="toggle-all" />
      <ul className="todo-list">
        {props.todos.map(todo => 
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggleClick={props.toggleTodo}
            {...props}
          >
          </TodoItem>
        )}
      </ul>
    </section>
  )
}

export default TodoList;
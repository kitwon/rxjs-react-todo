import React, { FunctionComponent } from 'react'
// import Todo from '../models/todoModel'
// import TodoItem from './TodoItem';

// interface ListProps {
//   todos: Todo[]
//   toggleTodo: (id: string) => void
//   deleteTodo: (id: string) => void
//   editTodo: (id: string, title: string) => void
// }

const TodoList: FunctionComponent = (props) => {
  return (
    <section className="main">
      <input type="checkbox" className="toggle-all" />
      <ul className="todo-list">
        { props.children }
      </ul>
    </section>
  )
}

export default TodoList;
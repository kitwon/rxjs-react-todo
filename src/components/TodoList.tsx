import React, { FC } from 'react'

const TodoList: FC = (props) => {
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
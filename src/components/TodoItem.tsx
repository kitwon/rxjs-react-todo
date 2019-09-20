import React, { FunctionComponent } from 'react'
import Todo from '../models/todoModel'

interface ItemProps {
  todo: Todo
  onToggleClick: (id: string) => void
}

const TodoItem: FunctionComponent<ItemProps> = (props) => {
  const { todo, onToggleClick } = props

  return (
    <li>
      <div className="view">
        <input
          type="checkbox"
          className="toggle"
          checked={todo.completed}
          onChange={() => onToggleClick(todo.id)}
        />
        <label>{todo.title}</label>
        <button 
          className="destroy" 
        >
        </button>
      </div>
      <input
        type="text"
        className="edit"
      />
    </li>
  )
}

export default TodoItem
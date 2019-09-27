import React, { useEffect, useState, KeyboardEvent, FC } from 'react'
import classnames from 'classnames'
import Todo from '../models/todoModel'

interface ItemProps {
  todo: Todo
  onToggleClick: (id: string) => void
  onDeleteClick: (id: string) => void
  onErrorClick: (todo: Todo) => void
  onEdit: (id: string, title: string) => void
}

const ESCAP_KEY = 27
const ENTER_KEY = 13

const TodoItem: FC<ItemProps> = (props) => {
  const { todo, onToggleClick, onDeleteClick, onEdit, onErrorClick } = props
  const [listClasses, setListClasses] = useState('')
  const [editing, setEditing] = useState(false)
  const [editedTitle, setTitle] = useState(todo.title)

  function submit(): void {
    if (editedTitle.length) {
      onEdit(todo.id, editedTitle)
    } else {
      onDeleteClick(todo.id)
    }
      setEditing(false)
  }

  const handleEdit = (): void => setEditing(!editing)
  const handleKeyDown = ({ keyCode }: KeyboardEvent<HTMLInputElement>): void => {
    if (keyCode === ESCAP_KEY || keyCode === ENTER_KEY) {
      submit()
    }
  }

  useEffect(() => {
    setListClasses(classnames({
      completed: todo.completed,
      editing: editing
    }))
  }, [todo.completed, editing])

  return (
    <li className={listClasses}>
      <div className="view">
        <input
          type="checkbox"
          className="toggle"
          checked={todo.completed}
          onChange={() => onToggleClick(todo.id)}
        />
        <label onDoubleClick={handleEdit}>{todo.title}</label>

        { todo.message
          ? <button className="retry" onClick={() => onErrorClick(todo) }>!</button>
          : <button className="destroy" onClick={() => onDeleteClick(todo.id)} />
        }
      </div>
      <input
        type="text"
        value={editedTitle}
        className="edit"
        onBlur={submit}
        onChange={(e) => setTitle(e.currentTarget.value.trim())}
        onKeyDown={handleKeyDown}
      />
    </li>
  )
}

export default TodoItem
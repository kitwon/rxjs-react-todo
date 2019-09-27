import React, { useState, useEffect, FC } from 'react'
import TodoHeader from './TodoHeader'
import TodoFooter from './TodoFooter'
import TodoList from './TodoList'
import TodoItem from './TodoItem'
import Todo from '../models/todoModel'
import TodoService from '../services/todoService'
import todoService from '../services/todoService'
import { RouteComponentProps } from 'react-router'

interface RouteParams {
  filter: string
}

const Todos: FC<RouteComponentProps<RouteParams>> = (props) => {
  const [todos, setTodos] = useState<Todo[]>([])
  const handleKeyDown = (title: string): void => TodoService.add(title)
  const handleToggleClick = (id: string): void => TodoService.toggle(id)
  const handleDeleteClick = (id: string): void => TodoService.delete(id)
  const handleErrorClick = (todo: Todo) => TodoService.add(todo)
  const handleRemoveComplete = (): void => TodoService.removeComplete()
  const handleEdit = (id: string, title: string): void => todoService.modify(id, title)
  const reaminingCount = todos.filter(i => !i.completed).length
  const hasComplete = todos.length > reaminingCount

  useEffect(() => {
    const todo$ = TodoService.todos$
      .subscribe(todos => {
        setTodos([...todos])
      })

    return function cleanUp() {
      todo$.unsubscribe()
    }
  }, [])

  const getVisibleTodos = (todos: Todo[]): Todo[] => {
    const { filter } = props.match.params
    if (filter === 'completed') {
      return todos.filter(i => i.completed)
    }
    if (filter === 'active') {
      return todos.filter(i => !i.completed)
    }

    return todos
  }
  
  return (
    <div className="todoapp">
      <TodoHeader onKeyDown={handleKeyDown} />
      <TodoList>
        {getVisibleTodos(todos).map(i => (
          <TodoItem
            todo={i}
            key={i.id}
            onToggleClick={handleToggleClick}
            onEdit={handleEdit}
            onDeleteClick={handleDeleteClick}
            onErrorClick={handleErrorClick}
          />
        ))}
      </TodoList>
      <TodoFooter
        remainingCount={reaminingCount}
        hasCompleted={hasComplete}
        onClearCompleteClick={handleRemoveComplete}
      />
    </div>
  )
}

export default Todos
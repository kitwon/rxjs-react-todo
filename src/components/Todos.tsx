import React, { FunctionComponent, useState, useEffect } from 'react'
import TodoHeader from './TodoHeader'
import TodoFooter from './TodoFooter'
import TodoList from './TodoList'
import Todo from '../models/todoModel'
import TodoService from '../services/todoService'
import { skip } from 'rxjs/operators'

const Todos: FunctionComponent = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const handleKeyDown = (title: string): void => TodoService.add(title)
  const handleToggleClick = (id: string): void => TodoService.toggle(id)

  useEffect(() => {
    console.log('call')
    const todo$ = TodoService.todos$
      .pipe(
        skip(1)
      )
      .subscribe(todos => {
        console.log(todos)
        setTodos(todos)
      })

    return function cleanUp() {
      todo$.unsubscribe()
    }
  })
  
  return (
    <div className="todoapp">
      <TodoHeader onKeyDown={handleKeyDown} />
      <TodoList
        todos={todos}
        toggleTodo={handleToggleClick}
      />
      <TodoFooter remainingCount={0} />
    </div>
  )
}

export default Todos
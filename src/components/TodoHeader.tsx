import React, { FunctionComponent, useRef } from 'react'

interface HeaderProps {
  onKeyDown: (title: string) => void
}

const ENTER_KEY_CODE = 13

const TodoHeader: FunctionComponent<HeaderProps> = ({ onKeyDown }) => {
  const input = useRef<HTMLInputElement>(null)
  const add = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.keyCode !== ENTER_KEY_CODE) return

    event.preventDefault()

    const value = event.currentTarget.value.trim()
    if (value) {
      onKeyDown(value)
      if (input.current) input.current.value = ''
    }
  }
  
  return (
    <header>
      <h1>todos</h1>
      <input 
        type="text"
        className="new-todo"
        placeholder="What needs to be done?"
        ref={input}
        onKeyDown={add}
      />
    </header>
  )
}

export default TodoHeader
import React, { FC } from 'react'
import { NavLink } from 'react-router-dom'

interface FooterProps {
  hasCompleted: boolean
  remainingCount: number
  onClearCompleteClick: () => void
}

const TodoFooter: FC<FooterProps> = (props: FooterProps) => {
  const { hasCompleted, remainingCount, onClearCompleteClick } = props
  let clearCompletedButton = null

  if (hasCompleted) {
    clearCompletedButton = (
      <button 
        className="clear-completed"
        onClick={onClearCompleteClick}
      >
        Clear Completed
      </button>
    );
  }

  return (
    <footer className="footer">
      <span className="todo-count"><strong>{remainingCount}</strong> item{remainingCount > 1 ? 's' : ''} left</span>
      <ul className="filters">
        <li><NavLink to="/" exact activeClassName="selected">All</NavLink></li>
        <li><NavLink to="/active" activeClassName="selected">Active</NavLink></li>
        <li><NavLink to="/completed" activeClassName="selected">Completed</NavLink></li>
      </ul>
      {clearCompletedButton}
    </footer>
  )
}

export default TodoFooter
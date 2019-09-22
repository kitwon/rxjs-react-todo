import { v4 } from 'uuid'

export default class Todo {
  id: string
  title: string
  completed?: boolean

  constructor(title: string) {
    this.id = v4()
    this.title = title
    this.completed = false
  }
}
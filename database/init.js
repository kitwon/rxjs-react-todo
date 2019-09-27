/* eslint-disable */
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const db = new sqlite3.Database(path.resolve(__dirname, '.', 'todos.db'), err => {
  if (err) throw err
  console.log('🌈 Database connect success \n')
})

db.exec(`
  create table if not exists todos (
    id varchar(50) primary key,
    title varchar(255),
    completed int(1)
  )
`, err => {
  if (err) throw err
  console.log('📝 Table todos create success or created')
})

db.close()
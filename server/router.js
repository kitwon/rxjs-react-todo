/* eslint-disable */
const express = require('express')
const sqlite3 = require('sqlite3')
const path = require('path')
const ResponseModel = require('./model')

const db = new sqlite3.Database(path.resolve(__dirname, '..', 'database/todos.db'), err => {
  if (err) throw new Error(err)
  console.log('🧲 Database connected')
})
const TABLE_NAME = 'todos'
const router = express.Router()

let retryTimes = 0

router.get('/', (req, res, next) => {
  db.all(`select * from ${TABLE_NAME}`, [], (err, data) => {
    if (err) return next(err)

    res.send(new ResponseModel('查询成功', 200, data || []))
  })
})

router.post('/', (req, res, next) => {
  if (retryTimes < 5) {
    retryTimes ++
    return next(new Error('Something wrong'))
  }

  const { title, id, completed } = req.body
  const todo = {
    id,
    title,
    completed: completed
  }

  db.run(`insert into ${TABLE_NAME} (id, title, completed) values(?, ?, ?)`, [id, title, Number(completed)], err => {
    if (err) return next(err)

    res.send(new ResponseModel('新建Todo成功', 200, todo))
  })
})

router.put('/:id', (req, res, next) => {
  const { id } = req.params
  const { title, completed } = req.body
  db.run(`update ${TABLE_NAME} set title=?, complete=? where id=?`, [title, Number(completed), id], err => {
    if (err) return next(err)

    res.send(new ResponseModel('更新Todo成功', 200, { id, title, completed }))
  })
})

router.delete('/:id', (req, res, next) => {
  const { id } = req.params
  du.run(`delete from ${TABLE_NAME} where id=?`, id, err => {
    if (err) return next(err)

    res.send(new ResponseModel(`删除Todo ${id} 成功`, 200))
  })
})

module.exports = router
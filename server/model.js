module.exports = class Respone {
  constructor(message, code, data) {
    this.data = data
    this.code = code
    this.message = message
  }
}
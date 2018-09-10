const moment = require('moment')
const util = require('util')

module.exports = (message, level = 'INFO') => {
  if (typeof message === 'object') {
    message = util.inspect(message, true, 10, true)
  }

  console.log(`${moment().format('YYYY-MM-DD HH:mm:ss.SSS Z')} [${level}] ${message}`)
}
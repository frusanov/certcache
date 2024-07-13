// const { https } = require('catkeys')
// const https = require('https')
const http = require('http')
const fetch = require('node-fetch')
const debug = require('debug')('certcache:request')

module.exports = (
  { host, port, catKeysDir },
  action,
  payload = {}
) => {
  const agent = new http.Agent({
    hostname: host,
    port
  })

  const postData = JSON.stringify({ action, ...payload })

  debug('request() request', {
    host,
    port,
    action,
    payload
  })
  debug('request() posting', postData)

  return fetch(`http://${host}:${port}/`, {
    agent,
    method: 'POST',
    body: postData,
    headers: {
      'Content-Length': Buffer.from(postData).length
    }
  }).then(async (res) => {
    const data = await res.json()

    debug('request() response', data)

    if (!data.success) {
      const error = new Error(data.error)
      error.resBody = data

      throw error
    }

    return data
  }).catch(e => {
    debug('request() error', e)
    throw e
  })
}

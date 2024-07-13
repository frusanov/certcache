// const { https } = require('catkeys')
// const https = require('https')
const https = require('http')
// const fs = require('fs')
const actions = require('./actions')
const getConfig = require('../getConfig')
const createRequestHandler = require('./createRequestHandler')

module.exports = async () => {
  const config = (await getConfig())
  const server = await https.createServer(
    {
      // key: fs.readFileSync(`${process.cwd()}/mTLS/server-key.pem`),
      // cert: fs.readFileSync(`${process.cwd()}/mTLS/server-crt.pem`),
      // ca: [
      //   fs.readFileSync(`${process.cwd()}/mTLS/client-ca-crt.pem`)
      // ]
    },
    createRequestHandler({ actions })
  )

  server.setTimeout(1000 * 60 * config.maxRequestTime)

  const srv = server.listen(config.server.port)

  process.once('SIGTERM', () => {
    srv.close()
  })
}

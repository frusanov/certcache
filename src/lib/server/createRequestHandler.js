const FeedbackError = require('../FeedbackError')
const getConfigManagerSingleton = require('../../config/config-manager')
const debug = require('debug')('certcache:server')
const { ZodError } = require('zod')

module.exports = function ({ actions }) {
  return async function (req, res) {
    const settingsManager = await getConfigManagerSingleton()
    await settingsManager.updatingPromise

    const data = []

    req.on('data', (chunk) => {
      data.push(chunk)
    })

    req.on('end', async () => {
      const requestBody = data.join('')
      let code = 200
      let result

      debug('Request received', requestBody)

      const { action, ...payload } = JSON.parse(requestBody)

      try {
        if (actions[action] === undefined) {
          throw new FeedbackError(`Action '${action}' not found`)
        }

        // TODO: remove this fallback
        const clientName = req.connection.getPeerCertificate
          ? req.connection.getPeerCertificate().subject.CN
          : 'unknown'

        result = {
          success: true,
          data: await actions[action](payload, { clientName })
        }
      } catch (error) {
        result = { success: false }
        code = error.code || 500

        if (error instanceof FeedbackError) {
          result.error = error.message
        }

        if (error instanceof ZodError) {
          result.error = 'Validation error'
          result.details = error.errors
        }
      }

      // socket might be destroyed during long running requests (eg. delays
      // waiting for DNS updates)
      if (res.socket.destroyed !== true) {
        res.writeHead(
          code,
          { 'Content-Type': 'application/json' }
        )
        res.write(JSON.stringify(result))
      }
      res.end()
      debug('Response sent')
    })
  }
}

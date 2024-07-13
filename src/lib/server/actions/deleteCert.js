const getConfigManagerSingleton = require('../../../config/config-manager')
const FeedbackError = require('../../FeedbackError')
const debug = require('debug')('certcache:server/actions/deleteCert')

module.exports = async function ({ certName }) {
  const configManager = await getConfigManagerSingleton()

  debug('certName', { certName })

  if (!certName || typeof certName !== 'string') {
    const error = new FeedbackError('certName is required and must be a string')
    error.code = 422
    throw error
  }

  return (await configManager.deleteCert(certName)).certs
}

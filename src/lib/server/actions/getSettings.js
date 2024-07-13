const getConfigManagerSingleton = require('../../../config/config-manager')
const debug = require('debug')('certcache:server/actions/getSettings')

module.exports = async function ({ payload }) {
  const configManager = await getConfigManagerSingleton()

  debug('payload', { payload })

  return configManager.getConfig()
}

const getConfigManagerSingleton = require('../../../config/config-manager')
const FeedbackError = require('../../FeedbackError')
const { settingsSchema } = require('../../validators/settings')
const debug = require('debug')('certcache:server/actions/updateSettings')

// HINT: currently not used

module.exports = async function ({ payload }) {
  const configManager = await getConfigManagerSingleton()

  debug('payload', { payload })

  const settings = await settingsSchema.pick({
    certs: true,
    extensions: true
  }).parseAsync(payload).catch((e) => {
    throw new FeedbackError(e.message || 'Invalid settings')
  })

  return configManager.updateConfig(settings)
}

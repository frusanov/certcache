const getConfigManagerSingleton = require('../../../config/config-manager')
const { certsSchema } = require('../../validators/certs')
const debug = require('debug')('certcache:server/actions/updateCerts')
const syncCerts = require('../../../lib/client/syncCerts')

module.exports = async function ({ certs }) {
  const configManager = await getConfigManagerSingleton()

  debug('certs', certs)

  const certsSafe = await certsSchema.parseAsync(certs).catch((e) => {
    e.code = 422
    throw e
  })

  const newCerts = (await configManager.updateCerts(certsSafe)).certs
  
  await syncCerts().catch((e) => {
    console.error(e)

    if (forever !== true) {
      process.exit(1)
    }
  })

  return newCerts
}

const getConfigManagerSingleton = require('../../../config/config-manager')
const { certsSchema } = require('../../validators/certs')
const debug = require('debug')('certcache:server/actions/updateCerts')

module.exports = async function ({ certs }) {
  const configManager = await getConfigManagerSingleton()

  debug('certs', certs)

  const certsSafe = await certsSchema.parseAsync(certs).catch((e) => {
    e.code = 422
    throw e
  })

  return (await configManager.updateCerts(certsSafe)).certs
}

const getConfigManagerSingleton = require('../config/config-manager')

module.exports = async ({ noCache } = {}) => {
  // if (cachedConfig === undefined || noCache === true) {
  //   cachedConfig = await load()
  // }

  // return cachedConfig
  return (await getConfigManagerSingleton()).getConfig()
}

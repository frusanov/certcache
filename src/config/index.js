const defaults = require('./defaults')

module.exports.certcacheHost = process.env.CERTCACHE_HOST ||
  defaults.certcacheHost
module.exports.certcachePort = process.env.CERTCACHE_PORT ||
  defaults.certcachePort
module.exports.certcacheCertDir = process.env.CERTCACHE_CERTS_DIR ||
  defaults.certcacheCertDir
module.exports.certbotExec = process.env.CERTCACHE_CERTBOT_EXEC ||
  defaults.certbotExec
module.exports.certbotConfigDir = process.env.CERTCACHE_CERTBOT_CONFIG_DIR ||
  defaults.certbotConfigDir
module.exports.certbotLogsDir = defaults.certbotLogsDir
module.exports.certbotWorkDir = defaults.certbotWorkDir
module.exports.letsencryptEmail = process.env.CERTCACHE_LETSENCRYPT_EMAIL
// XXX is `certcacheTmpDir` used?
module.exports.certcacheTmpDir = process.env.CERTCACHE_TMP_DIR ||
  defaults.certcacheTmpDir
module.exports.certbotHttpAuthPort = process
  .env
  .CERTCACHE_CERTBOT_HTTP_AUTH_PORT
module.exports.httpRedirectUrl = process.env.CERTCACHE_HTTP_REDIRECT_URL
module.exports.renewDaysBefore = (
  process.env.CERTCACHE_RENEW_DAYS_BEFORE === undefined
)
  ? defaults.renewDaysBefore
  : Number(process.env.CERTCACHE_RENEW_DAYS_BEFORE)
module.exports.clientSyncInterval = process
  .env
  .CERTCACHE_CLIENT_SYNC_INTERVAL ||
  defaults.clientSyncInterval
module.exports.clientCertWhitelist = process
  .env
  .CERTCACHE_CLIENT_CERT_WHITELIST
module.exports.thirdpartyDir = process.env.CERTCACHE_THIRDPARTY_DIR ||
  defaults.thirdpartyDir

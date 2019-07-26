const child_process = require('child_process')
const util = require('util')
const md5 = require('md5')

const execFile = util.promisify(child_process.execFile)

const generateHash = (commonName, altNames, isTest) => md5(JSON.stringify({
  commonName,
  altNames: altNames.map((name) => name.toLowerCase()).sort(),
  isTest
}))

const certsInGeneration = {}

module.exports = async (commonName, altNames, isTest) => {
  const certName = generateHash(commonName, altNames, isTest)
  const certbotExec = process.env.CERTCACHE_CERTBOT_EXEC || 'certbot'
  const certbotConfigDir = process.env.CERTCACHE_CERTBOT_CONFIG_DIR ||
    __dirname + '/../../certbot/config/'
  const email = process.env.CERTCACHE_LETSENCRYPT_EMAIL
  const certbotWorkDir = __dirname + '/../../certbot/work/'
  const certbotLogsDir = __dirname + '/../../certbot/logs/'
  const certbotHttpAuthPort = process.env.CERTCACHE_CERTBOT_HTTP_AUTH_PORT

  if (email === undefined) {
    throw new Error([
      'Missing email address to obtain letsencrypt certificates.',
      'Please provide env CERTCACHE_LETSENCRYPT_EMAIL'
    ].join(' '))
  }

  if (certsInGeneration[certName] === undefined) {
    const certbotArgs = [
      'certonly',
      '--non-interactive',
      '--break-my-certs',
      '--standalone',
      '--agree-tos',
      '--no-eff-email',
      `-d`,
      [commonName, ...altNames].join(','),
      `--cert-name`,
      certName,
      `-m`,
      email,
      `--config-dir`,
      certbotConfigDir,
      `--logs-dir`,
      certbotLogsDir,
      `--work-dir`,
      certbotWorkDir
    ]

    if (isTest) {
      certbotArgs.push('--test-cert')
    }

    if (certbotHttpAuthPort !== undefined) {
      certbotArgs.push('--http-01-port')
      certbotArgs.push(certbotHttpAuthPort)
    }

    certsInGeneration[certName] = execFile(certbotExec, certbotArgs)
  }

  try {
    await certsInGeneration[certName]
  } finally {
    delete certsInGeneration[certName]
  }

  return `${certbotConfigDir}/live/${certName}`
}

const getopts = require("getopts")
const requestCert = require('../helpers/requestCert')
const getLocalCertificates = require('../helpers/getLocalCertificates')
const config = require('../config')
const httpRedirect = require('../helpers/httpRedirect')

const opts = getopts(process.argv.slice(2), {
  alias: {host: 'h', test: 't', daemon: 'D'},
  default: {test: false, days: 30, daemon: false}
})

const syncCerts = async () => {
  const certcacheCertDir = config.certcacheCertDir
  const certs = await getLocalCertificates(certcacheCertDir)
  const certRenewEpoch = new Date()

  certRenewEpoch.setDate(certRenewEpoch.getDate() + opts.days)

  const certsForRenewal = certs
    .filter(({notAfter}) => (notAfter.getTime() < certRenewEpoch.getTime()))
  const host = opts.host || config.certcacheHost
  const port = opts.port || config.certcachePort
  const httpRedirectUrl = opts['http-redirect-url'] || config.httpRedirectUrl

  if (httpRedirectUrl !== undefined) {
    httpRedirect.start(httpRedirectUrl)
  }

  await Promise.all(certsForRenewal.map(({
    subject: {commonName},
    altNames,
    issuer: {commonName: issuerCommonName}
  }) => {
    const isTest = (issuerCommonName.indexOf('Fake') !== -1)

    altNames.splice(altNames.indexOf(commonName), 1)

    console.log([
      `Renewing certificate CN=${commonName}`,
      `SAN=${JSON.stringify(altNames)}`,
      isTest ? 'test' : 'live'}
    ].join(' '))

    return requestCert({host, port}, [commonName, ...altNames], isTest)
  }))

  if (httpRedirectUrl !== undefined) {
    httpRedirect.stop()
  }

  console.log(`${certsForRenewal.length} of ${certs.length} certs synced`)
}

syncCerts().catch((e) => {console.error(`ERROR! ${e}`)})
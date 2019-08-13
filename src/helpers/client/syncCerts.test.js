const syncCerts = require('./syncCerts')
const getopts = require('getopts')
const requestCert = require('../requestCert')
const getLocalCertificates = require('../getLocalCertificates')
const config = require('../../config')
const httpRedirect = require('../httpRedirect')

jest.mock('getopts')
jest.mock('../requestCert')
jest.mock('../httpRedirect')
jest.mock('../getLocalCertificates')

let mockOpts
let mockResponse
const mockConfig = {
  certcacheHost: 'bar.com',
  certcachePort: 54321
}

for (let i in mockConfig) {
  config[i] = mockConfig[i]
}

const generateMockCert = (tld, isTest = true, daysBeforeExpiry) => {
  const notAfter = new Date()

  notAfter.setDate(notAfter.getDate() + daysBeforeExpiry)

  return {
    commonName: tld,
    altNames: [tld, `www.${tld}`, `test.${tld}`],
    issuerCommonName: isTest
      ? 'Fake LE Intermediate X1'
      : 'Let\'s Encrypt Authority X3',
    notAfter
  }
}
const mockLocalCerts = [
  generateMockCert('example.com', true, 20),
  generateMockCert('93million.com', false, 10),
  generateMockCert('mcelderry.com', false, 50)
]
let mockCertsForRenewal

getopts.mockImplementation(() => {
  return mockOpts
})
requestCert.mockImplementation(() => {
  return Promise.resolve(JSON.stringify(mockResponse))
})
getLocalCertificates.mockReturnValue(mockLocalCerts)

console.error = jest.fn()
console.log = jest.fn()

beforeEach(() => {
  mockResponse = {success: true, data: {bundle: 'foobar54321'}}
  mockOpts = {
    host: 'example.com',
    port: 12345,
    days: 30
  }
  requestCert.mockClear()
  console.error.mockClear()
  console.log.mockClear()
  httpRedirect.start.mockClear()
  httpRedirect.stop.mockClear()

  const certRenewEpoch = new Date()

  certRenewEpoch.setDate(certRenewEpoch.getDate() + mockOpts.days)

  mockCertsForRenewal = mockLocalCerts
    .filter(({notAfter}) => (notAfter.getTime() < certRenewEpoch.getTime()))
})

test(
  'should request certs using args from command-line when provided',
  async () => {
    await syncCerts()

    mockCertsForRenewal.forEach((mockLocalCert, i) => {
      expect(requestCert).toBeCalledWith(
        {host: mockOpts.host, port: mockOpts.port},
        [mockLocalCert.commonName, ...mockLocalCert.altNames],
        mockLocalCert.issuerCommonName.indexOf('Fake') !== -1
      )
    })
  }
)

test(
  'should request certs using config when no command-line args provided',
  async () => {
    mockOpts = {days: 30}

    await syncCerts()

    mockCertsForRenewal.forEach((mockLocalCert, i) => {
      expect(requestCert).toBeCalledWith(
        {host: mockConfig.certcacheHost, port: mockConfig.certcachePort},
        [mockLocalCert.commonName, ...mockLocalCert.altNames],
        mockLocalCert.issuerCommonName.indexOf('Fake') !== -1
      )
    })
  }
)

test(
  'should start an http proxy when requested',
  async () => {
    const httpRedirectUrl = 'https://certcache.example.com'

    mockOpts = {'http-redirect-url': httpRedirectUrl, days: 30}
    await syncCerts()

    expect(httpRedirect.start).toBeCalledWith(httpRedirectUrl)
    expect(httpRedirect.stop).toBeCalledTimes(1)
  }
)

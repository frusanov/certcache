/* global jest beforeEach test expect */

const obtainCert = require('./obtainCert')
const requestCert = require('../requestCert')
const writeBundle = require('../writeBundle')

jest.mock('../requestCert')
jest.mock('../writeBundle')

console.error = jest.fn()
console.log = jest.fn()

let mockResponse

requestCert.mockImplementation(() => {
  return Promise.resolve(JSON.stringify(mockResponse))
})

const mockHost = 'certcache.example.com'
const mockPort = 54321
const mockCommonName = 'example.com'
const mockAltNames = ['test.example.com', 'foo.example.com']
const mockIsTest = true
const mockCertDirPath = '/test/path/certs/example.com'

beforeEach(() => {
  console.error.mockClear()
  console.log.mockClear()
  requestCert.mockClear()
  writeBundle.mockClear()

  mockResponse = { success: true, data: { bundle: 'foobar54321' } }
})

test(
  'should request certs using args provided',
  async () => {
    await obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      mockAltNames,
      mockIsTest,
      mockCertDirPath
    )

    expect(requestCert).toBeCalledWith(
      { host: mockHost, port: mockPort },
      [mockCommonName, ...mockAltNames],
      { isTest: mockIsTest }
    )
  }
)

test(
  'should write cert bundle to filesystem when received from certcache server',
  async () => {
    await obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      mockAltNames,
      mockIsTest,
      mockCertDirPath
    )

    expect(writeBundle).toBeCalledWith(
      mockCertDirPath,
      mockResponse.data.bundle
    )
  }
)

test(
  'should throw an error when failing to get cert from certcache server',
  async () => {
    mockResponse = { success: false }

    await expect(obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      mockAltNames,
      mockIsTest,
      mockCertDirPath
    ))
      .rejects
      .toThrow()
  }
)

test(
  'should throw an error containing messages retrieved from certcache server',
  async () => {
    const error = '__test error__'

    mockResponse = { success: false, error }

    await expect(obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      mockAltNames,
      mockIsTest,
      mockCertDirPath
    ))
      .rejects
      .toThrow(error)
  }
)

test(
  'should output information about certs retrieved from certcache server',
  async () => {
    await obtainCert(
      mockHost,
      mockPort,
      mockCommonName,
      mockAltNames,
      mockIsTest === false,
      mockCertDirPath
    )

    expect(console.log.mock.calls.map((args) => (args.join(' '))).join(' '))
      .toContain(mockCommonName)
  }
)

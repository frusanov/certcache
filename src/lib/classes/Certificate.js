const tar = require('tar-stream')
const zlib = require('zlib')
const getCertInfo = require('../getCertInfo')
const debug = require('debug')('certcache:certificate')

class Certificate {
  constructor (handlers, certInfo) {
    this.handlers = handlers

    for (const i in certInfo) {
      this[i] = certInfo[i]
    }
  }

  static async fromPath (handlers, certPath) {
    const certInfo = await getCertInfo(certPath)

    return new Certificate(handlers, certInfo)
  }

  async getArchive () {
    const pack = tar.pack()
    const bundle = await this.handlers.getBundle(this)

    pack.entry({ name: 'cert.pem' }, bundle.cert)
    pack.entry({ name: 'chain.pem' }, bundle.chain)
    pack.entry({ name: 'privkey.pem' }, bundle.privkey)
    pack.entry(
      { name: 'fullchain.pem' },
      Buffer.concat([Buffer.from(bundle.cert), Buffer.from(bundle.chain)])
    )
    pack.finalize()

    return new Promise((resolve) => {
      const chunks = []

      pack
        .pipe(zlib.createGzip())
        .on('data', (chunk) => {
          chunks.push(chunk)
        })
        .on('end', () => {
          debug(`created certificate archive from tar file`)
          resolve(Buffer.concat(chunks))
        })
    })
  }
}

module.exports = Certificate

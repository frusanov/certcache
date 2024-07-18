const syncPeriodically = require('../../lib/client/syncPeriodically')
const serve = require('../../lib/server/serve')
const { catkeys } = require('./args')

module.exports = {
  cmd: 'standalone',
  desc: 'Start certcache server',
  builder: {
    catkeys,
    port: {
      alias: 'p',
      description: 'Port to run Certcache server'
    }
  },
  handler: async (argv) => {
    await serve(argv);
    await syncPeriodically(true);
  }
}

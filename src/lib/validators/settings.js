const z = require('zod')
const { certsSchema } = require('./certs')
const { serverSchema } = require('./server')

const settingsSchema = z.object({
  binDir: z.string().min(1).default('bin').optional(),
  catKeysDir: z.string().min(1).default('catkeys').optional(),
  certDir: z.string().min(1).default('certs').optional(),
  certs: certsSchema,
  ellipticCurve: z.enum([
    'secp256r1',
    'secp384r1',
    'secp521r1'
  ]).default('secp256r1').optional(),
  httpRequestInterval: z.number().gt(0).default(1).optional(),
  keyType: z.enum(['rsa', 'ecdsa']).default('rsa').optional(),
  maxRequestTime: z.number().gt(0).default(90).optional(),
  renewalDays: z.number().int().gt(0).default(30).optional(),
  server: serverSchema,
  syncInterval: z.number().gt(0).default(360).optional(),
  upstream: z.string().min(1).default('--internal').optional(),
  extensions: z.any().optional()
})

module.exports = {
  settingsSchema
}

const z = require('zod')

const certSchema = z.object({
  certName: z.string().min(1),
  domains: z.array(z.string().min(1)).nonempty(),
  testCert: z.boolean().optional()
})

const certsSchema = z.array(certSchema)

module.exports = {
  certSchema,
  certsSchema
}

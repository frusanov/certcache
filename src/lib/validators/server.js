const z = require('zod')

const serverSchema = z.object({
  port: z.number().int().min(1).max(65535).default(4433).optional(),
  domainAccess: z.any().optional()
})

module.exports = {
  serverSchema
}

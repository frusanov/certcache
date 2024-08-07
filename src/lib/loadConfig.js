const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const config = require('../config/config')
const getExtensions = require('./getExtensions')
const fileExists = require('./helpers/fileExists')
const getArgv = require('./getArgv')

const readFile = promisify(fs.readFile)

//  - - -

const fileConfigPath = path.resolve(process.cwd(), 'conf', 'settings.json')

const loadConfig = async () => {
  const fileConfigBase = { extensions: {}, server: {} }

  const localFileConfig = await fileExists(fileConfigPath)
    ? JSON.parse(await readFile(fileConfigPath))
    : undefined
  const fileConfig = (localFileConfig !== undefined)
    ? { ...fileConfigBase, ...localFileConfig }
    : fileConfigBase

    
  const argv = getArgv()
  const env = process.env
  const mainConfig = await config({ argv, env, file: fileConfig })
    
  const extensions = await getExtensions()
  const extensionConfigs = Object.keys(extensions).reduce(
    (acc, key) => {
      if (extensions[key].config !== undefined) {
        const file = fileConfig.extensions[key] || {}

        acc[key] = extensions[key].config({ argv, env, file })
      }

      return acc
    },
    {}
  )

  return { ...mainConfig, extensions: extensionConfigs }
}

module.exports = loadConfig
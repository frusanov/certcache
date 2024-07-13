const { join } = require('path')
const fs = require('fs')
const { promisify } = require('util')
const getConfig = require('../lib/getConfig')
const _ = require('lodash')
// const loadConfig = require('../lib/loadConfig')
const getArgv = require('../lib/getArgv')
const config = require('./config')
const getExtensions = require('../lib/getExtensions')
const sleep = require('../lib/helpers/sleep')
const FeedbackError = require('../lib/FeedbackError')
const debug = require('debug')('certcache:config-manager')

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

const allowedToMerge = ['certs', 'extensions']

class ConfigManager {
  constructor () {
    this.path = join(process.cwd(), 'conf', 'settings.json')
    this.isInitialized = false

    this.updatingPromise = Promise.resolve()

    // ⠀⢸⠂⠀⠀⠀⠘⣧⠀⠀⣟⠛⠲⢤⡀⠀⠀⣰⠏⠀⠀⠀⠀⠀⢹⡀
    // ⠀⡿⠀⠀⠀⠀⠀⠈⢷⡀⢻⡀⠀⠀⠙⢦⣰⠏⠀⠀⠀⠀⠀⠀⢸⠀
    // ⠀⡇⠀⠀⠀⠀⠀⠀⢀⣻⠞⠛⠀⠀⠀⠀⠻⠀⠀⠀⠀⠀⠀⠀⢸⠀
    // ⠀⡇⠀⠀⠀⠀⠀⠀⠛⠓⠒⠓⠓⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⠀
    // ⠀⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⠀
    // ⠀⢿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⣀⣀⠀⠀⢀⡟⠀
    // ⠀⠘⣇⠀⠘⣿⠋⢹⠛⣿⡇⠀⠀⠀⠀⣿⣿⡇⠀⢳⠉⠀⣠⡾⠁⠀
    // ⣦⣤⣽⣆⢀⡇⠀⢸⡇⣾⡇⠀⠀⠀⠀⣿⣿⡷⠀⢸⡇⠐⠛⠛⣿⠀
    // ⠹⣦⠀⠀⠸⡇⠀⠸⣿⡿⠁⢀⡀⠀⠀⠿⠿⠃⠀⢸⠇⠀⢀⡾⠁⠀
    // ⠀⠈⡿⢠⢶⣡⡄⠀⠀⠀⠀⠉⠁⠀⠀⠀⠀⠀⣴⣧⠆⠀⢻⡄⠀⠀
    // ⠀⢸⠃⠀⠘⠉⠀⠀⠀⠠⣄⡴⠲⠶⠴⠃⠀⠀⠀⠉⡀⠀⠀⢻⡄⠀
    // ⠀⠘⠒⠒⠻⢦⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣤⠞⠛⠒⠛⠋⠁⠀
    // ⠀⠀⠀⠀⠀⠀⠸⣟⠓⠒⠂⠀⠀⠀⠀⠀⠈⢷⡀⠀⠀⠀⠀⠀⠀⠀
    // ⠀⠀⠀⠀⠀⠀⠀⠙⣦⠀⠀⠀⠀⠀⠀⠀⠀⠈⢷⠀⠀⠀⠀⠀⠀⠀
    // ⠀⠀⠀⠀⠀⠀⠀⣼⣃⡀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣆⠀⠀⠀⠀⠀⠀
    // ⠀⠀⠀⠀⠀⠀⠀⠉⣹⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⠀⠀⠀⠀⠀⠀
    // ⠀⠀⠀⠀⠀⠀⠀⠀⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⡆⠀⠀⠀⠀⠀
    // You like binding context, don't you?

    this._checkInitialized = this._checkInitialized.bind(this)
    this._checkFileExists = this._checkFileExists.bind(this)
    this._prepareFolderIfNotExists = this._prepareFolderIfNotExists.bind(this)
    this._readConfigFile = this._readConfigFile.bind(this)
    this._writeConfigFile = this._writeConfigFile.bind(this)
    this._mergeCerts = this._mergeCerts.bind(this)
    this._updateConfigFile = this._updateConfigFile.bind(this)

    this.init = this.init.bind(this)
    this.getConfig = this.getConfig.bind(this)
    this.updateConfig = this.updateConfig.bind(this)
    this.updateCerts = this.updateCerts.bind(this)
    this.deleteCert = this.deleteCert.bind(this)
  }

  // ~~ [Private methods] ~~

  _checkInitialized () {
    if (!this.isInitialized) {
      throw new Error('ConfigManager not initialized')
    }
  }

  /**
   * _mergeCerts
   * @param {Array} oldCerts
   * @param {Array} newCerts
   * @returns {Array}
   */
  _mergeCerts (oldCerts, newCerts) {
    const oldCertsByName = {}

    oldCerts.forEach(item => {
      oldCertsByName[item.certName] = item
    })

    newCerts.forEach(item => {
      oldCertsByName[item.certName] = item
    })

    return Object.values(oldCertsByName)
  }

  /**
   * _checkFileExists
   * @returns {Promise<boolean>}
   */
  async _checkFileExists () {
    if (!this.path) {
      throw new Error('ConfigManager path not set')
    }

    return fs.existsSync(this.path)
  }

  /**
   * _prepareFolderIfNotExists
   * @returns {Promise<void>}
   */
  async _prepareFolderIfNotExists () {
    const folder = join(process.cwd(), 'conf')
    if (!fs.existsSync(folder)) {
      await mkdir(folder)
    }
  }

  /**
   * _readConfigFile
   * @returns {Promise<any>}
   */
  async _readConfigFile () {
    const file = await readFile(this.path, { encoding: 'utf-8' })
    return JSON.parse(file)
  }

  /**
   * _writeConfigFile
   * @param {Object} config
   * @returns {Promise<void>}
   */
  async _writeConfigFile (config = null) {
    if (process.env['DEBUG']) {
      await sleep()
    }

    const encoded = JSON.stringify(config || this.current, null, 2)
    await writeFile(this.path, encoded)
  }

  /**
   * _updateConfigFile
   * @param {Object} newConfig
   * @returns {Promise<any>}
   */
  async _updateConfigFile (newConfig) {
    this._checkInitialized()

    console.log({ newConfig })

    if (!newConfig) {
      throw new Error('newConfig is required')
    }

    this.updatingPromise = (async () => {
      await this._writeConfigFile(newConfig)
      return this._readConfigFile()
    })()

    await this.updatingPromise
    await this.init()

    return this.updatingPromise
  }

  // ~~ [Public methods] ~~

  /**
   * init
   * @returns {Promise<ConfigManager>}
   */
  async init () {
    const fileConfigExists = await this._checkFileExists()
    const fileConfigBase = { extensions: {}, server: {} }

    let localFileConfig

    if (fileConfigExists) {
      localFileConfig = await this._readConfigFile()
    } else {
      localFileConfig = fileConfigBase
    }

    const fileConfig = { ...fileConfigBase, ...localFileConfig }

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

    this.current = { ...mainConfig, extensions: extensionConfigs }

    await this._prepareFolderIfNotExists()
    if (fileConfigExists) await this._writeConfigFile()

    this.isInitialized = true

    return this
  }

  /**
   * updateConfig
   * @param {Object} newConfig
   * @returns {Promise<any>}
   */
  async updateConfig (newConfig = {}) {
    this._checkInitialized()
    await this.updatingPromise

    const mergedConfig = _.mergeWith(
      this.current,
      _.pick(newConfig, allowedToMerge), (oldValue, newValue, path) => {
        if (path === 'certs') {
          return this._mergeCerts(oldValue, newValue)
        }
      }
    )

    return this._updateConfigFile(mergedConfig)
  }

  /**
   * deleteCert
   * @param {string} certName
   */
  async deleteCert (certName) {
    this._checkInitialized()
    await this.updatingPromise

    const draft = _.cloneDeep(this.current)
    const certsByName = {}

    draft.certs.forEach(item => {
      certsByName[item.certName] = item
    })

    // console.log({ current: this.current, draft });

    if (!certsByName[certName]) {
      const error = new FeedbackError(`Certificate ${certName} not found`)
      error.code = 404

      throw error
    }

    delete certsByName[certName]

    draft.certs = Object.values(certsByName)

    return this._updateConfigFile(draft)
  }

  /**
   * updateCerts
   * @param {Array} certs
   */
  async updateCerts (certs) {
    this._checkInitialized()
    await this.updatingPromise

    debug('updateCerts(): certs', certs)

    const draft = _.cloneDeep(this.current)

    draft.certs = this._mergeCerts(draft.certs, certs)

    return this._updateConfigFile(draft)
  }

  /**
   * getConfig
   * @returns {Promise<any>}
   */
  async getConfig () {
    this._checkInitialized()
    await this.updatingPromise

    await this.updatingPromise
    return this.current
  }
}

let configManager

/**
 * getConfigManagerSingleton
 * @returns {Promise<ConfigManager>}
 */
module.exports = async function getConfigManagerSingleton () {
  if (!configManager) {
    configManager = new ConfigManager()
    await configManager.init()
  }

  return configManager
}

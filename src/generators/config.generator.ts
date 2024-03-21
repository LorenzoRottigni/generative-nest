import { PrismaDriver } from '../drivers/prisma.driver'
import { GNestGenerator, Model } from '../types'
import { Generator } from './generator'

export class ConfigGenerator extends Generator implements GNestGenerator {
  constructor(model: Model, driver: PrismaDriver, private configDir = 'g.nest.conf') {
    super(model, driver)
  }

  public get sourceLocation(): [string, string] {
    return [
      `${this.configDir}/${this.model.name.toLowerCase()}`,
      `${this.model.name.toLowerCase()}.config.ts`,
    ]
  }

  generate() {
    return []
  }
}

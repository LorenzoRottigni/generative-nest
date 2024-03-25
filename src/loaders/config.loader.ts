import { getDMMF } from '@prisma/internals'
import { DMMF } from '@prisma/generator-helper'
import fs from 'fs'
import { GeneratorConfig, ModelConfig } from '../types'

/**
 * - if g.nest.conf doesn't exists invokes ConfigGenerator and then gets the generated one
 * - get config chunks from g.nest.conf
 * - extract config from each chunk
 * - compose the global config
 */
export class ConfigLoader {
  constructor(
    private config: Omit<GeneratorConfig, 'schema'> = {
      configDir: 'g.nest.conf',
      moduleDir: 'g.nest.modules',
      excludeFields: [],
      excludeModels: [],
      prismaSchema: 'tests/prisma/schema.prisma',
    },
    private schema?: DMMF.Document,
  ) {}

  async resolveModelChunks(schema: DMMF.Document): Promise<ModelConfig[]> {
    return await Promise.all(
      schema.datamodel.models.map(async (model): Promise<ModelConfig> => {
        try {
          const basePath = `${process.cwd()}/${this.config.configDir}/${model.name.toLowerCase()}`
          const path = `${basePath}/${model.name.toLowerCase()}.config.ts`
          if (!fs.existsSync(basePath)) {
          }
          await fs.promises.access(basePath)
          const config = await import(path)
          return config.default
        } catch (err) {
          console.error(err)
          return {
            name: model.name,
            permissions: [],
            validations: [],
            fields: model.fields.map((field) => ({
              name: field.name,
              permissions: [],
              type: field.type,
              validations: [],
            })),
          }
        }
      }),
    )
  }

  async getConfig(): Promise<GeneratorConfig> {
    const schema = this.schema || (await getDMMF({ datamodelPath: this.config.prismaSchema }))
    return {
      schema: {
        models: [...(await this.resolveModelChunks(schema))],
      },
      ...this.config,
    }
  }
}

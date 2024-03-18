import { DMMF } from '@prisma/generator-helper'
import { GeneratorConfig } from '../types';

export class ConfigService {
    constructor() {}

    public static getGeneratorConfig<t extends string>(schema: DMMF.Document, driver = 'prisma'): GeneratorConfig {
        return {
            schema: {
                models: schema.datamodel.models.map(model => ({
                    name: model.name,
                    fields: model.fields.map(field => ({
                        name: field.name,
                        type: field.type
                    }))
                }))
            }
        }
    }
}
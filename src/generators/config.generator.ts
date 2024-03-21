import ts from 'typescript'
import { PrismaDriver } from '../drivers/prisma.driver'
import { GNestGenerator, ModelConfig } from '../types'
import { Generator } from './generator'

export class ConfigGenerator extends Generator implements GNestGenerator {
  constructor(
    model: ModelConfig,
    driver: PrismaDriver,
    private configDir = 'g.nest.conf',
  ) {
    super(model, driver)
  }

  public get sourceLocation(): [string, string] {
    return [
      `${this.configDir}/${this.model.name.toLowerCase()}`,
      `${this.model.name.toLowerCase()}.config.ts`,
    ]
  }

  generate() {
    return [
      ts.factory.createExportAssignment(
        undefined,
        false,
        ts.factory.createObjectLiteralExpression([
          ts.factory.createPropertyAssignment(
            'fields',
            ts.factory.createArrayLiteralExpression(
              this.model.fields.map((field) =>
                ts.factory.createObjectLiteralExpression([
                  ts.factory.createPropertyAssignment(
                    'name',
                    ts.factory.createStringLiteral(field.type),
                  ),
                  ts.factory.createPropertyAssignment(
                    'type',
                    ts.factory.createStringLiteral(field.type),
                  ),
                  ts.factory.createPropertyAssignment(
                    'validations',
                    ts.factory.createArrayLiteralExpression([]),
                  ),
                  ts.factory.createPropertyAssignment(
                    'permissions',
                    ts.factory.createArrayLiteralExpression([]),
                  ),
                ]),
              ),
            ),
          ),
          ts.factory.createPropertyAssignment(
            'name',
            ts.factory.createStringLiteral(this.model.name.toLowerCase()),
          ),
          ts.factory.createPropertyAssignment(
            'configDir',
            ts.factory.createStringLiteral('g.nest.conf'),
          ),
          ts.factory.createPropertyAssignment(
            'modulesDir',
            ts.factory.createStringLiteral('g.nest.modules'),
          ),
          ts.factory.createPropertyAssignment(
            'excludeModels',
            ts.factory.createArrayLiteralExpression([]),
          ),
          ts.factory.createPropertyAssignment(
            'excludeFields',
            ts.factory.createArrayLiteralExpression([]),
          ),
        ]),
      ),
    ]
  }
}

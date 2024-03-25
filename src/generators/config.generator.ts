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

  public generate(): ts.Statement[] {
    return [
      ts.factory.createImportDeclaration(
        /* modifiers */ undefined,
        ts.factory.createImportClause(
          false,
          /* name */ undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              false,
              /* propertyName */ undefined,
              ts.factory.createIdentifier('ModelConfig'),
            ),
          ]),
        ),
        ts.factory.createStringLiteral(`../../src/types`),
      ),
      ts.factory.createExportAssignment(
        [],
        false,
        ts.factory.createAsExpression(
          ts.factory.createObjectLiteralExpression(
            [
              ts.factory.createPropertyAssignment(
                'fields',
                ts.factory.createArrayLiteralExpression(
                  this.model.fields.map((field) =>
                    ts.factory.createObjectLiteralExpression([
                      ts.factory.createPropertyAssignment(
                        'name',
                        ts.factory.createStringLiteral(field.name),
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
                'validations',
                ts.factory.createArrayLiteralExpression([]),
              ),
              ts.factory.createPropertyAssignment(
                'permissions',
                ts.factory.createArrayLiteralExpression([]),
              ),
            ],
            true,
          ),
          ts.factory.createTypeReferenceNode('ModelConfig'),
        ),
      ),
    ]
  }
}

import ts from 'typescript'
import { PrismaDriver } from '../drivers/prisma.driver'
import type { GNestGenerator, ModelConfig } from '../types'
import { NestLocation, PrismaAPI } from '../types/enums'
import { Generator } from './generator'
import { capitalize } from '../utils'

export class DTOGenerator extends Generator implements GNestGenerator {
  constructor(
    model: ModelConfig,
    driver: PrismaDriver,
    private moduleDir = 'g.nest.modules',
  ) {
    super(model, driver)
  }

  public get sourceLocation(): [string, string] {
    return [
      `${this.moduleDir}/${this.model.name.toLowerCase()}`,
      `${this.model.name.toLowerCase()}.${NestLocation.dto.toLowerCase()}.ts`,
    ]
  }

  generate(): ts.Statement[] {
    return [
      ts.factory.createClassDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)], // modifiers
        `${capitalize(this.model.name)}DTO`, // name
        undefined,
        [],
        [
          ts.factory.createConstructorDeclaration(
            [],
            this.model.fields
              .filter((field) => field.dto)
              .map((field) =>
                ts.factory.createParameterDeclaration(
                  [ts.factory.createModifier(ts.SyntaxKind.PublicKeyword)],
                  undefined,
                  field.name,
                  ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                  ts.factory.createTypeReferenceNode(this.driver.parseFieldType(field.type)),
                  undefined,
                ),
              ),
            ts.factory.createBlock([], true),
          ),
        ],
      ),
    ]
  }
}

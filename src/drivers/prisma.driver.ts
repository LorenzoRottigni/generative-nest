import ts from 'typescript'
import type { DMMF } from '@prisma/generator-helper'
import { PrismaAPI } from '../types/enums'
import type { GeneratorConfig, ModelConfig, ORMDriver } from '../types'
import { capitalize } from '../utils'

export class PrismaDriver implements ORMDriver {
  constructor() {}

  public get ORMApi() {
    return PrismaAPI
  }

  public parseFieldType(type: string): string {
    switch (type) {
      case 'Int':
        return 'number'
      case 'String':
        return 'string'
      case 'Boolean':
        return 'boolean'
      case 'DateTime':
        return 'Date'
      default:
        return 'any'
    }
  }

  public parseSchema(schema: DMMF.Document): GeneratorConfig {
    return {
      schema: {
        models: schema.datamodel.models.map(
          (model): ModelConfig => ({
            name: model.name,
            permissions: [],
            validations: [],
            enabled: true,
            fields: model.fields.map((field) => ({
              name: field.name,
              type: this.parseFieldType(field.type),
              permissions: [],
              validations: [],
              enabled: field.name !== 'id',
              dto: field.name !== 'id',
            })),
          }),
        ),
      },
      configDir: '',
      moduleDir: '',
      prismaSchema: '',
    }
  }

  public getModelsImport(models: string[]): ts.ImportDeclaration {
    return ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        true,
        undefined,
        ts.factory.createNamedImports(
          models.map((model) =>
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier(capitalize(model)),
            ),
          ),
        ),
      ),
      ts.factory.createStringLiteral('@prisma/client'),
    )
  }

  public get DBConnectionExpression(): ts.AccessExpression {
    return ts.factory.createPropertyAccessExpression(
      /* expression */ ts.factory.createIdentifier('prisma'),
      /* name */ ts.factory.createIdentifier('$connect'),
    )
  }

  public get DBClientImport(): ts.ImportDeclaration {
    return ts.factory.createImportDeclaration(
      /* modifiers */ undefined,
      ts.factory.createImportClause(
        /* isTypeOnly */ false,
        /* name (default import) */ undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier('PrismaClient'),
          ),
        ]),
      ),
      ts.factory.createStringLiteral('@prisma/client'),
    )
  }

  public get DBClientParam(): ts.ParameterDeclaration {
    return ts.factory.createParameterDeclaration(
      /* modifiers */ [ts.factory.createModifier(ts.SyntaxKind.PrivateKeyword)],
      /* dotDotToken */ undefined,
      /* name */ ts.factory.createIdentifier('prisma'),
      /* questionToken */ undefined,
      /* type */ undefined,
      /* initalizer */ ts.factory.createNewExpression(
        ts.factory.createIdentifier('PrismaClient'),
        undefined,
        [],
      ),
    )
  }

  /* this.prisma.<model>.<method>()*/
  public getCallExpression(
    model: string,
    method: PrismaAPI,
    prismaIdentifier = 'this.prisma',
  ): ts.CallExpression {
    return ts.factory.createCallExpression(
      /* expression */ ts.factory.createPropertyAccessExpression(
        /* expression */ ts.factory.createPropertyAccessExpression(
          /* expression */ ts.factory.createIdentifier(prismaIdentifier),
          /* name */ ts.factory.createIdentifier(model.toLowerCase()),
        ),
        /* name */ ts.factory.createIdentifier(method),
      ),
      /* typeArgs */ undefined,
      /* args */ [ts.factory.createIdentifier('args')],
    )
  }

  /**
   * Parameters<typeof this.prisma.<model>.<method>[0]
   */
  public getCallArgsType(
    model: string,
    method: PrismaAPI,
    prismaIdentifier = 'this.prisma',
  ): ts.IndexedAccessTypeNode {
    return ts.factory.createIndexedAccessTypeNode(
      /* objectType */ ts.factory.createTypeReferenceNode('Parameters', [
        /* typeName */ ts.factory.createTypeReferenceNode(
          `typeof ${prismaIdentifier}.${model.toLowerCase()}.${method}`,
        ),
      ]),
      /* indexType */ ts.factory.createLiteralTypeNode(ts.factory.createNumericLiteral('0')),
    )
  }

  /**
   * Promise<ReturnType<typeof this.prisma.<model>.<method><typeof Parameters<typeof this.prisma.<model>.<method>[0]>>>
   */
  public getCallReturnType(
    model: string,
    method: PrismaAPI,
    prismaIdentifier = 'this.prisma',
  ): ts.TypeReferenceNode {
    const argsType = ts
      .createPrinter()
      .printNode(
        ts.EmitHint.Unspecified,
        this.getCallArgsType(model, method),
        ts.createSourceFile('', '', ts.ScriptTarget.Latest),
      )
      .trim()
    return ts.factory.createTypeReferenceNode('ReturnType', [
      /* typeName */ ts.factory.createTypeReferenceNode(
        `typeof ${prismaIdentifier}.${model.toLowerCase()}.${method}<typeof ${argsType}>`,
      ),
    ])
  }
}

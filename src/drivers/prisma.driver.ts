import ts from 'typescript'
import type { DMMF } from '@prisma/generator-helper'
import type { PrismaAPI } from '../types/enums'
import type { GeneratorConfig, ORMDriver } from '../types'

export class PrismaDriver implements ORMDriver {
  constructor() {}

  public parseSchema(schema: DMMF.Document): GeneratorConfig {
    return {
      schema: {
        models: schema.datamodel.models.map((model) => ({
          name: model.name,
          fields: model.fields.map((field) => ({
            name: field.name,
            type: field.type,
          })),
        })),
      },
    }
  }

  public get DBConnectionExpression(): ts.AccessExpression {
    return ts.factory.createPropertyAccessExpression(
      /* expression */ ts.factory.createIdentifier('prisma'),
      /* name */ ts.factory.createIdentifier('$connect')
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
            ts.factory.createIdentifier('PrismaClient')
          ),
        ])
      ),
      ts.factory.createStringLiteral('@prisma/client')
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
        []
      )
    )
  }

  /* this.prisma.<model>.<method>()*/
  public getCallExpression(
    model: string,
    method: PrismaAPI,
    prismaIdentifier = ts.factory.createIdentifier('this.prisma')
  ): ts.CallExpression {
    return ts.factory.createCallExpression(
      /* expression */ ts.factory.createPropertyAccessExpression(
        /* expression */ ts.factory.createPropertyAccessExpression(
          /* expression */ prismaIdentifier,
          /* name */ ts.factory.createIdentifier(model.toLowerCase())
        ),
        /* name */ ts.factory.createIdentifier(method)
      ),
      /* typeArgs */ undefined,
      /* args */ [ts.factory.createIdentifier('args')]
    )
  }

  /**
   * Parameters<typeof this.prisma.<model>.<method>[0]
   */
  public getCallArgsType(
    model: string,
    method: PrismaAPI,
    prismaIdentifier = ts.factory.createIdentifier('this.prisma')
  ): ts.IndexedAccessTypeNode {
    return ts.factory.createIndexedAccessTypeNode(
      /* objectType */ ts.factory.createTypeReferenceNode('Parameters', [
        /* typeName */ ts.factory.createTypeReferenceNode(
          `typeof ${prismaIdentifier}.${model.toLowerCase()}.${method}`
        ),
      ]),
      /* indexType */ ts.factory.createLiteralTypeNode(ts.factory.createNumericLiteral('0'))
    )
  }

  /**
   * Promise<ReturnType<typeof this.prisma.<model>.<method><typeof Parameters<typeof this.prisma.<model>.<method>[0]>>>
   */
  public getCallReturnType(
    model: string,
    method: PrismaAPI,
    prismaIdentifier = ts.factory.createIdentifier('this.prisma')
  ): ts.TypeReferenceNode {
    const argsType = this.getCallArgsType(model, method).getText()
    return ts.factory.createTypeReferenceNode('ReturnType', [
      /* typeName */ ts.factory.createTypeReferenceNode(
        `typeof ${prismaIdentifier}.${model.toLowerCase()}.${method}<typeof ${argsType}>`
      ),
    ])
  }
}

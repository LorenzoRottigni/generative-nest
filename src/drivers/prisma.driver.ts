import ts from 'typescript'
import type { DMMF } from '@prisma/generator-helper'
import type { PrismaAPI } from '../types/enums'
import type { GeneratorConfig, ORMDriver } from '../types'

export class PrismaDriver implements ORMDriver {
    constructor() {}

    public parseSchema(schema: DMMF.Document): GeneratorConfig {
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

    /* this.prisma.<model>.<method>()*/
    public getCallExpression(
        model: string,
        method: PrismaAPI,
        prismaIdentifier = ts.factory.createIdentifier('this.prisma')
    ) {
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
    ) {
        return  ts.factory.createIndexedAccessTypeNode(
          /* objectType */ ts.factory.createTypeReferenceNode('Parameters', [
            /* typeName */ ts.factory.createTypeReferenceNode(`typeof ${prismaIdentifier}.${model.toLowerCase()}.${method}`),
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
    ) {
      const argsType = this.getCallArgsType(model, method).getText()
      return ts.factory.createTypeReferenceNode('ReturnType', [
        /* typeName */ ts.factory.createTypeReferenceNode(
          `typeof ${prismaIdentifier}.${model.toLowerCase()}.${method}<typeof ${argsType}>`
        ),
      ])
    }
} 
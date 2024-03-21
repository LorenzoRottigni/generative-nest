import type { PrismaDriver } from '../drivers/prisma.driver'
import type { BundleService } from '../services/bundle.service'
import type { GeneratorConfig, Model } from '../types'
import ts from 'typescript'
import { capitalize, pluralize } from '../utils'
import { NestDecorator, NestLocation, NestPackage, PrismaAPI } from '../types/enums'
import { NestService } from '../services/nest.service'

export class ControllerGenerator {
  constructor(
    private driver: PrismaDriver,
    private config: GeneratorConfig,
    private bundleService: BundleService
  ) {}

  public generateBundle(): string[] {
    return this.config.schema.models
      .map(
        (model) =>
          this.bundleService.updateSourceFile(model.name, NestLocation.controller, [
            NestService.getNestImport(
              [capitalize(NestLocation.controller), NestDecorator.post, NestDecorator.get],
              NestPackage.common
            ),
            this.getServiceImport(model.name),
            this.getModelControllerClass(model),
          ])?.fileName
      )
      .filter((f): f is string => !!f)
  }

  private getControllerConstructor(model: string): ts.ConstructorDeclaration {
    return ts.factory.createConstructorDeclaration(
      /* modifiers */ undefined,
      /* params */ [
        ts.factory.createParameterDeclaration(
          [ts.factory.createModifier(ts.SyntaxKind.PrivateKeyword)],
          undefined,
          `${model.toLowerCase()}${capitalize(NestLocation.service)}`,
          undefined,
          ts.factory.createTypeReferenceNode(
            `${capitalize(model)}${capitalize(NestLocation.service)}`
          )
        ),
      ],
      /* body */ ts.factory.createBlock([], /* multiline */ true)
    )
  }

  private getServiceImport(model: string): ts.ImportDeclaration {
    return ts.factory.createImportDeclaration(
      /* modifiers */ undefined,
      ts.factory.createImportClause(
        false,
        /* name */ undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            /* propertyName */ undefined,
            ts.factory.createIdentifier(`${capitalize(model)}${capitalize(NestLocation.service)}`)
          ),
        ])
      ),
      ts.factory.createStringLiteral(
        `./../${pluralize(NestLocation.service)}/${model.toLowerCase()}.${NestLocation.service}`
      )
    )
  }

  private getModelControllerClass(model: Model): ts.ClassDeclaration {
    return ts.factory.createClassDeclaration(
      /* modifiers */ [
        ts.factory.createDecorator(
          ts.factory.createCallExpression(
            ts.factory.createIdentifier(capitalize(NestLocation.controller)),
            /* type arguments */ undefined,
            /* arguments */ [ts.factory.createStringLiteral(pluralize(capitalize(model.name)))]
          )
        ),
        ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
      ],
      /* name */ `${capitalize(model.name)}${capitalize(NestLocation.controller)}`,
      /* typeParams */ [],
      /* heritageClauses */ [],
      /* members */ [
        this.getControllerConstructor(model.name),
        ...Object.values(this.driver.ORMApi).map((method) =>
          this.getModelControllerMethod(model.name, method)
        ),
      ]
    )
  }

  private getModelControllerMethod(model: string, method: PrismaAPI): ts.MethodDeclaration {
    const methodDecorator =
      method === PrismaAPI.findMany || method === PrismaAPI.findUnique ? 'Get' : 'Post'
    const parameters: ts.ParameterDeclaration[] = [
      ts.factory.createParameterDeclaration(
        /* modifiers */ [
          ts.factory.createDecorator(
            ts.factory.createCallExpression(ts.factory.createIdentifier('Body'), [], [])
          ),
        ],
        /* dotDotDotToken */ undefined,
        /* name */ ts.factory.createIdentifier('args'),
        /* questionToken */ undefined,
        /* type */ ts.factory.createIndexedAccessTypeNode(
          /* objectType */ ts.factory.createTypeReferenceNode('Parameters', [
            /* typeName */ ts.factory.createTypeReferenceNode(
              `typeof this.${model.toLowerCase()}${capitalize(NestLocation.service)}.${method}`
            ),
          ]),
          /* indexType */ ts.factory.createLiteralTypeNode(ts.factory.createNumericLiteral('0'))
        ),
        /* initializer */ undefined
      ),
    ]

    return ts.factory.createMethodDeclaration(
      /* modifiers */ [
        ts.factory.createDecorator(
          ts.factory.createCallExpression(
            ts.factory.createIdentifier(methodDecorator),
            /* type arguments */ undefined,
            /* arguments */ []
          )
        ),
        ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
      ],
      /* asteriskToken */ undefined,
      /* methodName */ method,
      /* questionToken */ undefined,
      /* typeParameters */ undefined,
      /* parameters */
      parameters,
      /* returnType */
      ts.factory.createTypeReferenceNode('ReturnType', [
        /* typeName */ ts.factory.createTypeReferenceNode(
          `typeof this.${model.toLowerCase()}${capitalize(NestLocation.service)}.${method}`
        ),
      ]),

      /* body */ ts.factory.createBlock(
        [
          ts.factory.createReturnStatement(
            ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier('this'),
                ts.factory.createIdentifier(
                  `${model.toLowerCase()}${capitalize(NestLocation.service)}.${method}`
                )
              ),
              /* type arguments */ undefined,
              /* arguments */ [ts.factory.createIdentifier('args')]
            )
          ),
        ],
        /* multiline */ true
      )
    )
  }
}

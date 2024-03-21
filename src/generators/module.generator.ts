import type { PrismaDriver } from '../drivers/prisma.driver'
import type { BundleService } from '../services/bundle.service'
import type { GeneratorConfig, Model } from '../types'
import ts from 'typescript'
import { NestHook, NestLocation, NestPackage, PrismaAPI } from '../types/enums'
import { capitalize, pluralize } from '../utils'
import { NestService } from '../services/nest.service'

export class ModuleGenerator {
  constructor(
    private driver: PrismaDriver,
    private config: GeneratorConfig,
    private bundleService: BundleService
  ) {}

  public generateBundle(): string[] {
    return this.config.schema.models
      .map(
        (model) =>
          this.bundleService.updateSourceFile(model.name, NestLocation.module, [
            NestService.getNestImport(
              [capitalize(NestLocation.module), ...Object.values(NestHook)],
              NestPackage.common
            ),
            ...[NestLocation.service, NestLocation.controller].map((location) =>
              this.getModelNestLocationImport(model.name, location)
            ),
            this.getModelModule(model.name),
          ])?.fileName
      )
      .filter((f): f is string => !!f)
  }

  private getModelNestLocationImport(model: string, location: NestLocation): ts.ImportDeclaration {
    return ts.factory.createImportDeclaration(
      /* modifiers */ undefined,
      ts.factory.createImportClause(
        false,
        /* name */ undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            /* propertyName */ undefined,
            ts.factory.createIdentifier(`${capitalize(model)}${capitalize(location)}`)
          ),
        ])
      ),
      ts.factory.createStringLiteral(
        `./${pluralize(location)}/${model.toLowerCase()}.${location.toLowerCase()}`
      )
    )
  }

  public getModelModule(model: string): ts.ClassDeclaration {
    return ts.factory.createClassDeclaration(
      /* modifiers */ [
        ts.factory.createDecorator(
          ts.factory.createCallExpression(
            ts.factory.createIdentifier(capitalize(NestLocation.module)),
            /* type arguments */ undefined,
            [
              ts.factory.createObjectLiteralExpression([
                ts.factory.createPropertyAssignment(
                  ts.factory.createIdentifier('providers'),
                  ts.factory.createArrayLiteralExpression([
                    ts.factory.createIdentifier(
                      `${capitalize(model)}${capitalize(NestLocation.service)}`
                    ),
                  ])
                ),
                ts.factory.createPropertyAssignment(
                  ts.factory.createIdentifier('controllers'),
                  ts.factory.createArrayLiteralExpression([
                    ts.factory.createIdentifier(
                      `${capitalize(model)}${capitalize(NestLocation.controller)}`
                    ),
                  ])
                ),
              ]),
            ]
          )
        ),
        ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
      ],
      /* name */ `${capitalize(model)}${capitalize(NestLocation.module)}`,
      /* typeParameters */ undefined,
      /* heritageClauses */ [
        ts.factory.createHeritageClause(ts.SyntaxKind.ImplementsKeyword, [
          ...Object.values(NestHook).map((hook) =>
            ts.factory.createExpressionWithTypeArguments(
              ts.factory.createIdentifier(hook),
              undefined
            )
          ),
        ]),
      ],
      /* members */ [
        ...Object.keys(NestHook).map((hook) =>
          ts.factory.createMethodDeclaration(
            /* modifiers */ undefined,
            /* asteriskToken */ undefined,
            hook,
            /* questionToken */ undefined,
            /* typeParameters */ undefined,
            /* parameters */ [],
            /* returnType */ ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword),
            ts.factory.createBlock([], false)
          )
        ),
      ]
    )
  }
}

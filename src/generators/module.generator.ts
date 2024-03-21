import ts from 'typescript'
import { GNestGenerator, ModelConfig } from '../types'
import { NestHook, NestLocation, NestPackage } from '../types/enums'
import { Generator } from './generator'
import { capitalize } from '../utils'
import { NestService } from '../services/nest.service'
import { PrismaDriver } from '../drivers/prisma.driver'

export class ModuleGenerator extends Generator implements GNestGenerator {
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
      `${this.model.name.toLowerCase()}.${NestLocation.module.toLowerCase()}.ts`,
    ]
  }

  generate(): ts.Statement[] {
    return [
      NestService.getNestImport(
        [capitalize(NestLocation.module), ...Object.values(NestHook)],
        NestPackage.common,
      ),
      ...[NestLocation.service, NestLocation.controller].map((location) =>
        this.getModelNestLocationImport(this.model.name, location),
      ),
      this.getModelModule(this.model.name),
    ]
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
            ts.factory.createIdentifier(`${capitalize(model)}${capitalize(location)}`),
          ),
        ]),
      ),
      ts.factory.createStringLiteral(`./${model.toLowerCase()}.${location.toLowerCase()}`),
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
                      `${capitalize(model)}${capitalize(NestLocation.service)}`,
                    ),
                  ]),
                ),
                ts.factory.createPropertyAssignment(
                  ts.factory.createIdentifier('controllers'),
                  ts.factory.createArrayLiteralExpression([
                    ts.factory.createIdentifier(
                      `${capitalize(model)}${capitalize(NestLocation.controller)}`,
                    ),
                  ]),
                ),
              ]),
            ],
          ),
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
              undefined,
            ),
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
            ts.factory.createBlock([], false),
          ),
        ),
      ],
    )
  }
}

import type { PrismaDriver } from '../drivers/prisma.driver'
import type { BundleService } from '../services/bundle.service'
import type { GeneratorConfig } from '../types'
import ts from 'typescript'
import { capitalize } from '../utils'
import { NestLocation } from '../types/enums'

export class ServiceGenerator {
  constructor(
    private driver: PrismaDriver,
    private config: GeneratorConfig,
    private bundleService: BundleService
  ) {}

  public get serviceConstructor(): ts.ConstructorDeclaration {
    return ts.factory.createConstructorDeclaration(
      /* modifiers */ undefined,
      /* params */ [this.driver.DBClientParam],
      /* body */ ts.factory.createBlock(
        [ts.factory.createExpressionStatement(this.driver.DBConnectionExpression)],
        /* multiline */ true
      )
    )
  }

  public getModelServiceClass(modelName: string): ts.ClassDeclaration {
    return ts.factory.createClassDeclaration(
      /* modifiers */ [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      /* name */ `${capitalize(modelName)}Service`,
      /* typeParams */ [],
      /* heritageClauses */ [],
      /* members */ [this.serviceConstructor]
    )
  }

  public generateBundle(): string[] {
    return this.config.schema.models
      .map(
        (model) =>
          this.bundleService.updateSourceFile(model.name, NestLocation.service, [
            this.driver.DBClientImport,
            this.getModelServiceClass(model.name),
          ])?.fileName
      )
      .filter((f): f is string => !!f)
  }
}

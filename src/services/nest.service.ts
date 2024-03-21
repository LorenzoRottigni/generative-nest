import ts from 'typescript'
import { NestHook, NestPackage } from '../types/enums'

export class NestService {
  constructor() {}

  public static getNestImport(
    imports: string[],
    source: NestPackage = NestPackage.common
  ): ts.ImportDeclaration {
    return ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports(
          imports.map((namedImport) =>
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier(namedImport)
            )
          )
        )
      ),
      ts.factory.createStringLiteral(source)
    )
  }
}

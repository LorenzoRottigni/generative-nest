import { GeneratorConfig, GNestBundle, Model } from '../types'
import ts from 'typescript'
import fs from 'fs'
import _path from 'path'
import { ServiceGenerator } from '../generators/service.generator'
import { ControllerGenerator } from '../generators/controller.generator'
import { ModuleGenerator } from '../generators/module.generator'
import { PrismaDriver } from '../drivers/prisma.driver'
import { ConfigGenerator } from '../generators/config.generator'

export class BundleService {
  constructor(
    private generators: Array<
      new (model: Model, driver: PrismaDriver) =>
        | ServiceGenerator
        | ControllerGenerator
        | ModuleGenerator
        | ConfigGenerator
    >,
    private config: GeneratorConfig,
    private driver: PrismaDriver
  ) {}

  public async generateBundle() {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
    for (const model of this.config.schema.models) {
      for (const Generator of this.generators) {
        const generator = new Generator(model, this.driver)
        const [path, fileName] = generator.sourceLocation
        const sourceFile = await this.createSourceFile(fileName, path)
        const file = ts.factory.updateSourceFile(sourceFile, generator.generate())
        await fs.promises.writeFile(
          _path.join(process.cwd(), file.fileName),
          printer.printFile(file)
        )
      }
    }
  }

  public async createSourceFile(
    filename: string,
    path: string | undefined
  ): Promise<ts.SourceFile> {
    if (path?.startsWith('/')) path = path.slice(1, path.length - 1)
    if (path?.startsWith('./')) path = path.slice(2, path.length - 1)
    if (path?.endsWith('/')) path = path.slice(0, path.length - 2)
    if (path) filename = _path.join(path, filename)
    try {
      if (path) {
        const dirs = path.split('/')
        let dir = '.'
        for (let i = 0; i < dirs.length; i++) {
          dir += `/${dirs[i]}`
          if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir)
          }
        }
      }
      return ts.createSourceFile(filename, '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
    } catch (err) {
      console.error(err)
      return ts.createSourceFile(filename, '', ts.ScriptTarget.Latest, false, ts.ScriptKind.TS)
    }
  }
}

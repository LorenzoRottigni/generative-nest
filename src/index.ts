import ts from 'typescript'
import fs from 'fs'
import prettier from 'prettier'
import _path from 'path'
import { PrismaDriver } from './drivers/prisma.driver'
import { GeneratorConfig, ModelConfig } from './types'
import { Generator } from './generators/generator'

const createSourceFile = async (
  filename: string,
  path: string | undefined,
): Promise<ts.SourceFile> => {
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

export async function generateBundle(
  generators: Array<new (model: ModelConfig, driver: PrismaDriver) => Generator>,
  config: GeneratorConfig,
  driver: PrismaDriver,
): Promise<string[]> {
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  const report = []
  for (const model of config.schema.models) {
    for (const Generator of generators) {
      try {
        const generator = new Generator(model, driver)
        const [path, fileName] = generator.sourceLocation
        const sourceFile = await createSourceFile(fileName, path)
        const file = ts.factory.updateSourceFile(sourceFile, generator.generate())
        await fs.promises.writeFile(
          _path.join(process.cwd(), file.fileName),
          await prettier.format(printer.printFile(file), {
            parser: 'typescript',
            semi: true,
            singleQuote: true,
            tabWidth: 2,
          }),
        )
        report.push(file.fileName)
      } catch (err) {
        console.error(err)
      }
    }
  }

  return report
}

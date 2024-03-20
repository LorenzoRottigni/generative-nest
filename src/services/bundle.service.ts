import { GeneratorConfig, ModelBundle } from '../types'
import { NestLocation } from '../types/enums'
import ts from 'typescript'
import fs from 'fs'
import _path from 'path'

export class BundleService {
  constructor(
    private config: GeneratorConfig,
    public bundle: ModelBundle[] = [],
    private baseDir = '.g-nest'
  ) {}

  public async loadBundle(): Promise<boolean> {
    try {
      for (const model of this.config.schema.models) {
        const modelDir = `${this.baseDir}/${model.name.toLowerCase()}`
        this.bundle.push({
          services: [
            await this.createSourceFile(
              `${model.name.toLowerCase()}.${NestLocation.service}.ts`,
              `${modelDir}/${NestLocation.service}s`
            ),
          ],
          resolvers: [
            await this.createSourceFile(
              `${model.name.toLowerCase()}.${NestLocation.resolver}.ts`,
              `${modelDir}/${NestLocation.resolver}s`
            ),
          ],
          controllers: [
            await this.createSourceFile(
              `${model.name.toLowerCase()}.${NestLocation.controller}.ts`,
              `${modelDir}/${NestLocation.controller}s`
            ),
          ],
          plugin: await this.createSourceFile(
            `${model.name.toLowerCase()}.${NestLocation.plugin}.ts`,
            modelDir
          ),
          events: await this.createSourceFile(`${model.name.toLowerCase()}.events.ts`, modelDir),
        })
      }

      return this.bundle.length === this.config.schema.models.length
    } catch (err) {
      console.error(err)
      return false
    }
  }

  public async generateBundle(): Promise<string[]> {
    try {
      const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
      return (
        await Promise.all(
          this.bundle.map(
            async (modelBundle) =>
              await Promise.all(
                Object.values(modelBundle).map(
                  async (sourceFile: ts.SourceFile | ts.SourceFile[]) =>
                    Array.isArray(sourceFile)
                      ? await Promise.all(
                          sourceFile.map(
                            async (sourceFile: ts.SourceFile) =>
                              await this.writeFile(
                                sourceFile.fileName,
                                printer.printFile(sourceFile)
                              )
                          )
                        )
                      : await this.writeFile(sourceFile.fileName, printer.printFile(sourceFile))
                )
              )
          )
        )
      )
        .flat(3)
        .filter((f): f is string => !!f)
    } catch (err) {
      console.error(err)
      return []
    }
  }

  public async writeFile(filename: string, file: string): Promise<string | null> {
    try {
      console.log(_path.join(process.cwd(), filename))
      await fs.promises.writeFile(_path.join(process.cwd(), filename), file)
      return filename
    } catch (err) {
      console.error(err)
      return null
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

  public getModelBundleIndex(model: string): number {
    return this.bundle.findIndex((b) => b.plugin.fileName.split('.').includes(model.toLowerCase()))
  }

  public getSourceFile(model: string, location: NestLocation): ts.SourceFile | null {
    const bundle = this.bundle[this.getModelBundleIndex(model)]
    if (!this.bundle) return null
    const key = Object.keys(bundle).find((k) => k.toLowerCase().includes(location.toLowerCase()))
    if (!key || !(key in bundle)) return null
    return bundle[key]
  }

  public setSourceFile(model: string, location: NestLocation, sourceFile: ts.SourceFile) {
    const i = this.getModelBundleIndex(model)
    let key = Object.keys(this.bundle[i]).find((k) =>
      k.toLowerCase().includes(location.toLowerCase())
    )
    key = key && key in this.bundle[i] ? key : undefined
    if (!key) return false
    this.bundle[this.getModelBundleIndex(model)][key] = sourceFile
  }
}

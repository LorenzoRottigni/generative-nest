import { GeneratorConfig, ModelBundle } from '../types'
import { NestLocation } from '../types/enums'
import ts from 'typescript'
import fs from 'fs'

export class BundleService {
  constructor(
    private config: GeneratorConfig,
    private bundle: ModelBundle[],
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

  public generateBundle(): string[] {
    try {
      const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
      return this.bundle
        .map((modelBundle) =>
          Object.values(modelBundle).map((sourceFile) =>
            Array.isArray(sourceFile)
              ? sourceFile.map((sourceFile) => printer.printFile(sourceFile))
              : printer.printFile(sourceFile)
          )
        )
        .flat(3)
    } catch (err) {
      console.error(err)
      return []
    }
  }

  public async createSourceFile(
    filename: string,
    path: string | undefined
  ): Promise<ts.SourceFile> {
    if (path?.startsWith('/')) path = path.slice(1, path.length - 1)
    if (path?.startsWith('./')) path = path.slice(2, path.length - 1)
    if (path?.endsWith('/')) path = path.slice(0, path.length - 2)
    filename = `${path}/${filename}`
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
    return this.bundle.findIndex(
      (b) => b.plugin.fileName.split('.')[0].toLowerCase() === model.toLowerCase()
    )
  }

  public getSourceFile(model: string, location: NestLocation): ts.SourceFile | null {
    const bundle = this.bundle[this.getModelBundleIndex(model)]
    if (!this.bundle) return null
    const key = Object.keys(bundle).find((k) => k.toLowerCase().includes(location.toLowerCase()))
    if (!key || !(key in bundle)) return null
    return bundle[key]
  }

  public setSourceFile(model: string, location: NestLocation, sourceFile: ts.SourceFile) {
    const key = this.findSourceKey(model, location)
    if (!key) return false
    this.bundle[this.getModelBundleIndex(model)][key] = sourceFile
  }

  public findSourceKey(model: string, location: string): string | null {
    const i = this.getModelBundleIndex(model)
    const k = Object.keys(this.bundle[i]).find((k) =>
      k.toLowerCase().includes(location.toLowerCase())
    )
    return k && k in this.bundle[i] ? k : null
  }
}

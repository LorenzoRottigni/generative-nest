import { Statement } from 'typescript'
import { PrismaDriver } from '../drivers/prisma.driver'
import { GNestGenerator, ModelConfig } from '../types'

export class Generator implements GNestGenerator {
  constructor(
    protected model: ModelConfig,
    protected driver: PrismaDriver,
  ) {}

  get sourceLocation(): [string, string] {
    return ['', '']
  }

  generate(): Statement[] {
    return []
  }
}

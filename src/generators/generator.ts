import { PrismaDriver } from '../drivers/prisma.driver'
import { ModelConfig } from '../types'

export class Generator {
  constructor(
    protected model: ModelConfig,
    protected driver: PrismaDriver,
  ) {}
}

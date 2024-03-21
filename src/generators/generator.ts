import { PrismaDriver } from '../drivers/prisma.driver'
import { Model } from '../types'

export class Generator {
  constructor(protected model: Model, protected driver: PrismaDriver) {}
}

import { PrismaDriver } from '../src/drivers/prisma.driver'
import { BundleService } from '../src/services/bundle.service'
import { getDMMF } from '@prisma/internals'

describe('bundle.service', () => {
  it('Should generate bundle.', async () => {
    const prismaDriver = new PrismaDriver()
    const schema = await getDMMF({ datamodelPath: 'tests/prisma/schema.prisma' })
    const bundleService = new BundleService(prismaDriver.parseSchema(schema))
    await bundleService.loadBundle()
    console.log(bundleService.bundle)
    console.log(await bundleService.generateBundle())
  })
})

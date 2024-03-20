import { PrismaDriver } from '../src/drivers/prisma.driver'
import { ServiceGenerator } from '../src/generators/service.generator'
import { BundleService } from '../src/services/bundle.service'
import { getDMMF } from '@prisma/internals'

describe('bundle.service', () => {
  it('Should generate bundle.', async () => {
    const prismaDriver = new PrismaDriver()
    const schema = await getDMMF({ datamodelPath: 'tests/prisma/schema.prisma' })
    const config = prismaDriver.parseSchema(schema)
    const bundleService = new BundleService(config)
    await bundleService.loadBundle()
    const serviceGenerator = new ServiceGenerator(prismaDriver, config, bundleService)
    console.log(serviceGenerator.generateBundle())
    console.log(bundleService.bundle[0].services[0].fileName)
    console.log(await bundleService.generateBundle())
  })
})

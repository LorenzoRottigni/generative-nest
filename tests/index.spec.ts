import { PrismaDriver } from '../src/drivers/prisma.driver'
import { ControllerGenerator } from '../src/generators/controller.generator'
import { ModuleGenerator } from '../src/generators/module.generator'
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
    const generators = [
      new ServiceGenerator(prismaDriver, config, bundleService),
      new ControllerGenerator(prismaDriver, config, bundleService),
      new ModuleGenerator(prismaDriver, config, bundleService),
    ]
    generators.forEach((generator) => console.log(generator.generateBundle()))

    console.log(await bundleService.generateBundle())
  })
})

import { generateBundle } from '../src'
import { PrismaDriver } from '../src/drivers/prisma.driver'
import { ConfigGenerator } from '../src/generators/config.generator'
import { ControllerGenerator } from '../src/generators/controller.generator'
import { ModuleGenerator } from '../src/generators/module.generator'
import { ServiceGenerator } from '../src/generators/service.generator'
import { getDMMF } from '@prisma/internals'

describe('bundle.service', () => {
  it('Should generate bundle.', async () => {
    const prismaDriver = new PrismaDriver()
    const schema = await getDMMF({ datamodelPath: 'tests/prisma/schema.prisma' })
    const config = prismaDriver.parseSchema(schema)

    console.log(
      await generateBundle(
        [ConfigGenerator, ServiceGenerator, ControllerGenerator, ModuleGenerator],
        config,
        prismaDriver,
      ),
    )
  })
})

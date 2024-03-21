import { generateBundle } from '../src'
import { PrismaDriver } from '../src/drivers/prisma.driver'
import { ConfigGenerator } from '../src/generators/config.generator'
import { ControllerGenerator } from '../src/generators/controller.generator'
import { ModuleGenerator } from '../src/generators/module.generator'
import { ServiceGenerator } from '../src/generators/service.generator'
import { getDMMF } from '@prisma/internals'

async function main() {
  const prismaDriver = new PrismaDriver()
  const schema = await getDMMF({ datamodelPath: 'tests/prisma/schema.prisma' })

  // load the config from g.nest.conf or parse the schema
  const config = prismaDriver.parseSchema(schema)

  await generateBundle(
    [
      // push config generator only if it failed to load config from g.nest.conf
      ConfigGenerator,
      ServiceGenerator,
      ControllerGenerator,
      ModuleGenerator,
    ],
    config,
    prismaDriver,
  )
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

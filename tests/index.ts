import { generateBundle } from '../src'
import { PrismaDriver } from '../src/drivers/prisma.driver'
import { ConfigGenerator } from '../src/generators/config.generator'
import { ControllerGenerator } from '../src/generators/controller.generator'
import { DTOGenerator } from '../src/generators/dto.generator'
import { ModuleGenerator } from '../src/generators/module.generator'
import { ServiceGenerator } from '../src/generators/service.generator'
import { ConfigLoader } from '../src/loaders/config.loader'

async function main() {
  const prismaDriver = new PrismaDriver()
  const configLoader = new ConfigLoader()
  const config = await configLoader.getConfig()
  // load the config from g.nest.conf or parse the schema
  // const config = prismaDriver.parseSchema(schema)

  console.log(JSON.stringify(config, null, 2))
  await generateBundle(
    [ConfigGenerator, ServiceGenerator, ControllerGenerator, ModuleGenerator, DTOGenerator],
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

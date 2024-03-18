export enum PrismaAPI {
  findMany = 'findMany',
  findUnique = 'findUnique',
  create = 'create',
  update = 'update',
  delete = 'delete',
}

export enum EventHook {
    before = 'before',
    after = 'after',
}

export enum NestLocation {
    resolver = 'resolver',
    controller = 'controller',
    service = 'service',
    handler = 'handler',
    plugin = 'plugin',
}
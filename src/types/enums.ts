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
  module = 'module',
  dto = 'dto',
}

export enum NestHook {
  onApplicationBootstrap = 'OnApplicationBootstrap',
  onModuleInit = 'OnModuleInit',
  onModuleDestroy = 'OnModuleDestroy',
  beforeApplicationShutdown = 'BeforeApplicationShutdown',
  onApplicationShutdown = 'OnApplicationShutdown',
}

export enum NestPackage {
  core = '@nestjs/core',
  common = '@nestjs/common',
}

export enum NestDecorator {
  injectable = 'Injectable',
  get = 'Get',
  post = 'Post',
}

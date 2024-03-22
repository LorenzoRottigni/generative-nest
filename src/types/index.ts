import ts from 'typescript'
import type { DMMF } from '@prisma/generator-helper'
import { PrismaAPI } from './enums'
import {
  BeforeApplicationShutdown,
  OnApplicationBootstrap,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common'

export declare interface FieldConfig {
  name: string
  type: string
  permissions: string[]
  validations: string[]
}

export declare interface ModelConfig {
  name: string
  fields: FieldConfig[]
}

export declare interface GeneratorConfig {
  schema: {
    models: ModelConfig[]
  }
  moduleDir: string
  configDir: string
  excludeModels: string[]
  excludeFields: string[]
  prismaSchema: string
}

export declare type NestHooks = OnApplicationBootstrap &
  OnModuleInit &
  OnModuleDestroy &
  BeforeApplicationShutdown &
  OnApplicationShutdown

export declare interface ORMDriver {
  parseSchema(schema: DMMF.Document): GeneratorConfig
  getCallExpression: (
    model: string,
    method: PrismaAPI,
    prismaIdentifier: string,
  ) => ts.CallExpression
  getCallArgsType: (
    model: string,
    method: PrismaAPI,
    prismaIdentifier: string,
  ) => ts.IndexedAccessTypeNode
  getCallReturnType: (
    model: string,
    method: PrismaAPI,
    prismaIdentifier: string,
  ) => ts.TypeReferenceNode
}

export declare interface GNestGenerator {
  // used from bundleService to create the SourceFile for the model that has been instantiated with the generator
  get sourceLocation(): [string, string]
  generate(): ts.Statement[]
}

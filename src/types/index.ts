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

export declare interface Field {
  name: string
  type: string
}

export declare interface Model {
  name: string
  fields: Field[]
}

export declare interface GeneratorConfig {
  schema: {
    models: Model[]
  }
}

export declare interface ModelBundle {
  module: ts.SourceFile
  events: ts.SourceFile
  services: ts.SourceFile[]
  controllers: ts.SourceFile[]
  resolvers: ts.SourceFile[]
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
    prismaIdentifier: string
  ) => ts.CallExpression
  getCallArgsType: (
    model: string,
    method: PrismaAPI,
    prismaIdentifier: string
  ) => ts.IndexedAccessTypeNode
  getCallReturnType: (
    model: string,
    method: PrismaAPI,
    prismaIdentifier: string
  ) => ts.TypeReferenceNode
}

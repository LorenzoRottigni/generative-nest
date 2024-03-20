import ts from "typescript"
import type { DMMF } from '@prisma/generator-helper'
import { PrismaAPI } from "./enums"

export declare interface Field {
    name: string,
    type: string
}

export declare interface Model {
    name: string,
    fields: Field[]
}

export declare interface GeneratorConfig {
    schema: {
        models: Model[]
    }
}

export declare interface ModelBundle {
    plugin: ts.SourceFile,
    events: ts.SourceFile,
    services: ts.SourceFile[],
    controllers: ts.SourceFile[],
    resolvers: ts.SourceFile[],
}

export declare interface ORMDriver {
    parseSchema(schema: DMMF.Document): GeneratorConfig
    getCallExpression: (
        model: string,
        method: PrismaAPI,
        prismaIdentifier: ts.Identifier
    ) => ts.CallExpression
    getCallArgsType: (
        model: string,
        method: PrismaAPI,
        prismaIdentifier: ts.Identifier
    ) => ts.IndexedAccessTypeNode
    getCallReturnType: (
        model: string,
        method: PrismaAPI,
        prismaIdentifier: ts.Identifier
    ) => ts.TypeReferenceNode
}
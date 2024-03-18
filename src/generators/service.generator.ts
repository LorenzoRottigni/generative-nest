import type { PrismaDriver } from "../drivers/prisma.driver";
import { GeneratorConfig } from "../types";

export class ServiceGenerator {
    constructor(
        private driver: PrismaDriver,
        private config: GeneratorConfig,
    ) {}
}
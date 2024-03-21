import ts from 'typescript'
import { GNestGenerator, Model } from '../types'
import { NestDecorator, NestLocation, NestPackage, PrismaAPI } from '../types/enums'
import { Generator } from './generator'
import { capitalize } from '../utils'
import { PrismaDriver } from '../drivers/prisma.driver'
import { NestService } from '../services/nest.service'

export class ServiceGenerator extends Generator implements GNestGenerator {
  constructor(model: Model, driver: PrismaDriver, private moduleDir = 'g.nest.modules') {
    super(model, driver)
  }

  public get sourceLocation(): [string, string] {
    return [
      `${this.moduleDir}/${this.model.name.toLowerCase()}`,
      `${this.model.name.toLowerCase()}.${NestLocation.service.toLowerCase()}.ts`,
    ]
  }

  generate(): ts.Statement[] {
    return [
      this.driver.DBClientImport,
      this.driver.getModelsImport([this.model.name]),
      NestService.getNestImport([NestDecorator.injectable], NestPackage.common),
      this.getModelServiceClass(this.model),
    ]
  }

  private get serviceConstructor(): ts.ConstructorDeclaration {
    return ts.factory.createConstructorDeclaration(
      /* modifiers */ undefined,
      /* params */ [this.driver.DBClientParam],
      /* body */ ts.factory.createBlock(
        [ts.factory.createExpressionStatement(this.driver.DBConnectionExpression)],
        /* multiline */ true
      )
    )
  }

  private getModelServiceClass(model: Model): ts.ClassDeclaration {
    return ts.factory.createClassDeclaration(
      /* modifiers */ [
        ts.factory.createDecorator(
          ts.factory.createCallExpression(
            ts.factory.createIdentifier(NestDecorator.injectable),
            /* type arguments */ undefined,
            /* arguments */ []
          )
        ),
        ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
      ],
      /* name */ `${capitalize(model.name)}${capitalize(NestLocation.service)}`,
      /* typeParams */ [],
      /* heritageClauses */ [],
      /* members */ [
        this.serviceConstructor,
        ...Object.values(this.driver.ORMApi).map((method) =>
          this.getModelMethod(model.name, method)
        ),
        /* member */ ...model.fields
          .map((field) =>
            field.name !== 'id' ? this.getModelFieldGetterMethod(model.name, field) : []
          )
          .flat(1),
        /* member */ ...model.fields
          .map((field) =>
            field.name !== 'id' ? this.getModelFieldSetterMethod(model.name, field) : []
          )
          .flat(1),
      ]
    )
  }

  /**
   * @description Generates a public service model method:
   * public async <method>(
   *   args: Parameters<typeof this.prisma.<model>.<method>[0] = {}
   * ): Promise<ReturnType<typeof this.prisma.<model>.<method><typeof args>>> {
   *   var result = await this.prisma.<model>.<method>(args)
   *   return result
   * }
   * @param {string} model Service class.
   * @param {string} method Service method.
   * @returns {ts.MethodDeclaration}
   */
  private getModelMethod(model: string, method: PrismaAPI): ts.MethodDeclaration {
    return ts.factory.createMethodDeclaration(
      /* modifiers */ [
        ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
        ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword),
      ],
      /* asteriskToken */ undefined,
      /* methodName */ method,
      /* questionToken */ undefined,
      /* typeParameters */ undefined,
      /* parameters */ [
        ts.factory.createParameterDeclaration(
          /* modifiers */ undefined,
          /* dotDotDotToken */ undefined,
          /* name */ 'args',
          /* questionToken */ undefined,
          /* type */ this.driver.getCallArgsType(model, method),
          /* initializer */ method === PrismaAPI.findMany
            ? ts.factory.createObjectLiteralExpression()
            : undefined
        ),
      ],
      /* returnType */ ts.factory.createTypeReferenceNode('Promise', [
        ts.factory.createTypeReferenceNode('ReturnType', [
          /* typeName */ ts.factory.createTypeReferenceNode(
            `typeof this.prisma.${model.toLowerCase()}.${method}<typeof args>`
          ),
        ]),
      ]),
      /* body */ ts.factory.createBlock(
        [
          /* var result = await this.prisma.<model>.<method>(args); */ ts.factory.createVariableStatement(
            /* modifiers */ [],
            /* declarations */ [
              ts.factory.createVariableDeclaration(
                /* name */ ts.factory.createIdentifier('result'),
                /* exclamationToken */ undefined,
                /* type */ undefined,
                /* await */ ts.factory.createAwaitExpression(
                  ts.factory.createCallExpression(
                    /* expression */ ts.factory.createPropertyAccessExpression(
                      /* expression */ ts.factory.createPropertyAccessExpression(
                        /* expression */ ts.factory.createIdentifier('this.prisma'),
                        /* name */ ts.factory.createIdentifier(model.toLowerCase())
                      ),
                      /* name */ ts.factory.createIdentifier(method)
                    ),
                    /* typeArgs */ undefined,
                    /* args */ [ts.factory.createIdentifier('args')]
                  )
                )
              ),
            ]
          ),
          /* return result; */ ts.factory.createReturnStatement(
            ts.factory.createIdentifier('result')
          ),
        ],
        /* multiline */ true
      )
    )
  }

  /**
   * @description Generates a public class method for getting the given model's field:
   * public async get<Field>(id: number): Promise<string | null> {
   *     return (await this.prisma.<model>.<field>({ where: { id: id }, select: { <field>: true } }))!.<field>! ?? null;
   * }
   * @param modelName
   * @param field
   * @returns {ts.MethodDeclaration}
   */
  private getModelFieldGetterMethod(
    modelName: string,
    field: { name: string; type: string }
  ): ts.MethodDeclaration {
    return ts.factory.createMethodDeclaration(
      /* modifiers */ [
        ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
        ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword),
      ],
      /* asteriskToken */ undefined,
      /* methodName */ `get${capitalize(field.name)}`,
      /* questionToken */ undefined,
      /* typeParams */ undefined,
      /* params */ [
        ts.factory.createParameterDeclaration(
          /* modifiers */ undefined,
          /* dotDotToken */ undefined,
          /* name */ ts.factory.createIdentifier('id'),
          /* type */ undefined,
          /* initializer */ ts.factory.createTypeReferenceNode('number', [])
        ),
      ],
      /* returnType */ ts.factory.createTypeReferenceNode(
        'Promise',
        /* typeArgs */ [
          ts.factory.createUnionTypeNode([
            ts.factory.createTypeReferenceNode(field.type),
            ts.factory.createTypeReferenceNode('null'),
          ]),
        ]
      ),
      /* body */ ts.factory.createBlock(
        [
          /* statement */ ts.factory.createReturnStatement(
            /* expression */ ts.factory.createBinaryExpression(
              /* left */ ts.factory.createNonNullExpression(
                /* expresison */ ts.factory.createPropertyAccessExpression(
                  /* expression */ ts.factory.createNonNullExpression(
                    /* await */ ts.factory.createAwaitExpression(
                      /* expression */ ts.factory.createCallExpression(
                        /* expression */ ts.factory.createPropertyAccessExpression(
                          /* expression */ ts.factory.createPropertyAccessExpression(
                            /* expression */ ts.factory.createIdentifier('this.prisma'),
                            /* name */ ts.factory.createIdentifier(modelName.toLowerCase())
                          ),
                          ts.factory.createIdentifier(PrismaAPI.findUnique)
                        ),
                        /* typeArgs */ undefined,
                        /* args */ [
                          ts.factory.createObjectLiteralExpression(
                            /* properties */ [
                              ts.factory.createPropertyAssignment(
                                /* name */ ts.factory.createIdentifier('where'),
                                /* initalizer */ ts.factory.createObjectLiteralExpression(
                                  /* properties */ [
                                    ts.factory.createPropertyAssignment(
                                      ts.factory.createIdentifier('id'),
                                      ts.factory.createIdentifier('id')
                                    ),
                                  ]
                                )
                              ),
                              ts.factory.createPropertyAssignment(
                                /* name */ ts.factory.createIdentifier('select'),
                                /* initalizer */ ts.factory.createObjectLiteralExpression([
                                  ts.factory.createPropertyAssignment(
                                    ts.factory.createIdentifier(field.name),
                                    ts.factory.createTrue()
                                  ),
                                ])
                              ),
                            ]
                          ),
                        ]
                      )
                    )
                  ),
                  /* name */ ts.factory.createIdentifier(field.name)
                )
              ),
              /* operator */ ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
              /* right */ ts.factory.createNull()
            )
          ),
        ],
        /* multiline */ true
      )
    )
  }

  /**
   * @description Generates a public class method for setting the given model's field:
   * public async set<Model>(id: number, <field>: string): Promise<User> {
   *     this.busHandler.publishEvent("<Model><Field>Before<Method>", { args: { where: { id: id }, data: { <field>: <field> } }, prisma: this.prisma });
   *     const result = await this.prisma.<model>.update({ where: { id: id }, data: { <field>: <field> } });
   *     this.busHandler.publishEvent("<Model><Field>After<Method>", { where: { id: id }, data: { <field>: <field> } }, prisma: this.prisma, result: result });
   *     return result;
   * }
   * @param model
   * @param field
   * @returns {ts.MethodDeclaration}
   */
  private getModelFieldSetterMethod(
    model: string,
    field: { name: string; type: string }
  ): ts.MethodDeclaration {
    /* public async set<Model>(id: number, <field>: string): Promise<<Model>> */
    return ts.factory.createMethodDeclaration(
      /* modifiers */ [
        ts.factory.createModifier(ts.SyntaxKind.PublicKeyword),
        ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword),
      ],
      /* asteriskToken */ undefined,
      /* methodName */ `set${capitalize(field.name)}`,
      /* questionToken */ undefined,
      /* typeParams */ undefined,
      /* params */ [
        ts.factory.createParameterDeclaration(
          /* modifiers */ undefined,
          /* dotDotToken */ undefined,
          /* name */ ts.factory.createIdentifier('id'),
          /* questionToken */ undefined,
          /* type */ ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
        ),
        ts.factory.createParameterDeclaration(
          /* modifiers */ undefined,
          /* dotDotToken */ undefined,
          /* name */ ts.factory.createIdentifier(field.name),
          /* questionToken */ undefined,
          /* type */ ts.factory.createTypeReferenceNode(field.type)
        ),
      ],
      /* returnType */ ts.factory.createTypeReferenceNode('Promise', [
        ts.factory.createTypeReferenceNode(capitalize(model), []),
      ]),
      /* body */ ts.factory.createBlock(
        [
          /* statement */ ts.factory.createVariableStatement(
            /* modifiers */ [],
            /* declarations */ ts.factory.createVariableDeclarationList(
              [
                ts.factory.createVariableDeclaration(
                  /* name */ ts.factory.createIdentifier('result'),
                  /* exclamationToken */ undefined,
                  /* type */ undefined,
                  /* initializer */ ts.factory.createAwaitExpression(
                    /* expression */ ts.factory.createCallExpression(
                      /* expression */ ts.factory.createPropertyAccessExpression(
                        ts.factory.createPropertyAccessExpression(
                          ts.factory.createIdentifier('this.prisma'),
                          ts.factory.createIdentifier(model.toLowerCase())
                        ),
                        ts.factory.createIdentifier(PrismaAPI.update)
                      ),
                      /* typeArgs */ undefined,
                      /* args */ [
                        ts.factory.createObjectLiteralExpression(
                          /* properties */ [
                            ts.factory.createPropertyAssignment(
                              /* name */ ts.factory.createIdentifier('where'),
                              /* initializer */ ts.factory.createObjectLiteralExpression(
                                /* properties */ [
                                  ts.factory.createPropertyAssignment(
                                    /* name */ ts.factory.createIdentifier('id'),
                                    /* initalizer */ ts.factory.createIdentifier('id')
                                  ),
                                ]
                              )
                            ),
                            ts.factory.createPropertyAssignment(
                              /* name */ ts.factory.createIdentifier('data'),
                              /* initalizer */ ts.factory.createObjectLiteralExpression(
                                /* properties */ [
                                  ts.factory.createPropertyAssignment(
                                    ts.factory.createIdentifier(field.name),
                                    ts.factory.createIdentifier(field.name)
                                  ),
                                ]
                              )
                            ),
                          ]
                        ),
                      ]
                    )
                  )
                ),
              ],
              ts.NodeFlags.Const
            )
          ),
          /* statement */ ts.factory.createReturnStatement(ts.factory.createIdentifier('result')),
        ],
        /* multiline */ true
      )
    )
  }
}

import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { functionWithDataAccess } from "../function/functionWithDataAccess/resource";

const schema = a.schema({
  Todo: a
    .model({
      content: a.string(),
      status: a.enum(["PENDING", "COMPLETED"]),
      createdAt: a.datetime(),
    })
    .secondaryIndexes((index) => [
      // ステータス別にTodoを作成日時順で検索するためのIndex
      index("status").sortKeys(["createdAt"]).queryField("todosByStatus"),
    ])
    .authorization((allow) => [allow.authenticated()]),

  // カスタムミューテーション
  createCustomTodo: a
    .mutation()
    .arguments({
      content: a.string().required(),
      status: a.enum(["PENDING", "COMPLETED"]),
    })
    .returns(a.json())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(functionWithDataAccess)),
})
.authorization(allow => [
  allow.resource(functionWithDataAccess).to(["mutate"]) // 関数からデータにmutateできるようにするため、Schemaに対してMutateの許可を設定
]);

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

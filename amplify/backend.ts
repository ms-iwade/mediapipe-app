import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { storage } from "./storage/resource";
import { functionWithDataAccess } from "./function/functionWithDataAccess/resource";

/**
 * Amplify Gen2 Backend Configuration
 *
 * このファイルは、Amplifyバックエンドのエントリーポイントです。
 * 各リソース（認証、データ、ストレージなど）をここで統合します。
 *
 * @see https://docs.amplify.aws/react/build-a-backend/
 */

// ==================================================
// Backend Resources Definition
// ==================================================

const backend = defineBackend({
  auth,
  data,
  storage,
  functionWithDataAccess,
});

// ==================================================
// Cognito User Pool Configuration
// ==================================================

/**
 * Cognito User Poolの詳細設定
 * L1 Constructを使用して、より細かい設定を行います
 * SSOの設定を行う場合は以下を参考にしてください。
 * @see https://trust-coms.atlassian.net/wiki/spaces/DX/pages/944177657/Amplify+Cognito+Hosted+UI+SSO
 */
const { cfnUserPool } = backend.auth.resources.cfnResources;

// ユーザー名でのログインを有効化
cfnUserPool.usernameAttributes = [];

// パスワードポリシーの設定
cfnUserPool.policies = {
  passwordPolicy: {
    minimumLength: 6, // パスワードの最小文字数
    requireLowercase: true, // 小文字
    requireNumbers: true, // 数字
    requireSymbols: false, // 記号
    requireUppercase: false, // 大文字
    temporaryPasswordValidityDays: 7, // 一時パスワードの有効期間
  },
};
/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as contacts from "../contacts.js";
import type * as http from "../http.js";
import type * as interactions from "../interactions.js";
import type * as journeyStages from "../journeyStages.js";
import type * as middleware from "../middleware.js";
import type * as migrations from "../migrations.js";
import type * as opportunities from "../opportunities.js";
import type * as users from "../users.js";
import type * as venues from "../venues.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  contacts: typeof contacts;
  http: typeof http;
  interactions: typeof interactions;
  journeyStages: typeof journeyStages;
  middleware: typeof middleware;
  migrations: typeof migrations;
  opportunities: typeof opportunities;
  users: typeof users;
  venues: typeof venues;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

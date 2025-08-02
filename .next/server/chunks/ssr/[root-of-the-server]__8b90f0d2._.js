module.exports = {

"[project]/.next-internal/server/app/page/actions.js [app-rsc] (server actions loader, ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({});
}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/app/_components/post.tsx [app-rsc] (client reference proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "LatestPost": ()=>LatestPost
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const LatestPost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LatestPost() from the server but LatestPost is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/_components/post.tsx <module evaluation>", "LatestPost");
}),
"[project]/src/app/_components/post.tsx [app-rsc] (client reference proxy)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "LatestPost": ()=>LatestPost
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const LatestPost = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call LatestPost() from the server but LatestPost is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/app/_components/post.tsx", "LatestPost");
}),
"[project]/src/app/_components/post.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$_components$2f$post$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/app/_components/post.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$_components$2f$post$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/app/_components/post.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$_components$2f$post$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/server/api/trpc.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */ __turbopack_context__.s({
    "createCallerFactory": ()=>createCallerFactory,
    "createTRPCContext": ()=>createTRPCContext,
    "createTRPCRouter": ()=>createTRPCRouter,
    "publicProcedure": ()=>publicProcedure
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$initTRPC$2d$IT_6ZYJd$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@trpc/server/dist/initTRPC-IT_6ZYJd.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$superjson$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/superjson/dist/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$ZodError$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/ZodError.js [app-rsc] (ecmascript)");
;
;
;
const createTRPCContext = async (opts)=>{
    return {
        ...opts
    };
};
/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */ const t = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$trpc$2f$server$2f$dist$2f$initTRPC$2d$IT_6ZYJd$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["initTRPC"].context().create({
    transformer: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$superjson$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"],
    errorFormatter ({ shape, error }) {
        return {
            ...shape,
            data: {
                ...shape.data,
                zodError: error.cause instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$ZodError$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ZodError"] ? error.cause.flatten() : null
            }
        };
    }
});
const createCallerFactory = t.createCallerFactory;
const createTRPCRouter = t.router;
/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */ const timingMiddleware = t.middleware(async ({ next, path })=>{
    const start = Date.now();
    if (t._config.isDev) {
        // artificial delay in dev
        const waitMs = Math.floor(Math.random() * 400) + 100;
        await new Promise((resolve)=>setTimeout(resolve, waitMs));
    }
    const result = await next();
    const end = Date.now();
    console.log(`[TRPC] ${path} took ${end - start}ms to execute`);
    return result;
});
const publicProcedure = t.procedure.use(timingMiddleware);
}),
"[project]/src/server/api/routers/post.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "postRouter": ()=>postRouter
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-rsc] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/api/trpc.ts [app-rsc] (ecmascript)");
;
;
const posts = [
    {
        id: 1,
        name: "Hello World"
    }
];
const postRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createTRPCRouter"])({
    hello: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        text: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string()
    })).query(({ input })=>{
        return {
            greeting: `Hello ${input.text}`
        };
    }),
    create: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["publicProcedure"].input(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
    })).mutation(async ({ input })=>{
        const post = {
            id: posts.length + 1,
            name: input.name
        };
        posts.push(post);
        return post;
    }),
    getLatest: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["publicProcedure"].query(()=>{
        return posts.at(-1) ?? null;
    })
});
}),
"[project]/src/server/api/root.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "appRouter": ()=>appRouter,
    "createCaller": ()=>createCaller
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$routers$2f$post$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/api/routers/post.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/api/trpc.ts [app-rsc] (ecmascript)");
;
;
const appRouter = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createTRPCRouter"])({
    post: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$routers$2f$post$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["postRouter"]
});
const createCaller = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createCallerFactory"])(appRouter);
}),
"[project]/src/trpc/query-client.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "createQueryClient": ()=>createQueryClient
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$hydration$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/hydration.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$superjson$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/superjson/dist/index.js [app-rsc] (ecmascript)");
;
;
const createQueryClient = ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["QueryClient"]({
        defaultOptions: {
            queries: {
                // With SSR, we usually want to set some default staleTime
                // above 0 to avoid refetching immediately on the client
                staleTime: 30 * 1000
            },
            dehydrate: {
                serializeData: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$superjson$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].serialize,
                shouldDehydrateQuery: (query)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$hydration$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["defaultShouldDehydrateQuery"])(query) || query.state.status === "pending"
            },
            hydrate: {
                deserializeData: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$superjson$2f$dist$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].deserialize
            }
        }
    });
}),
"[project]/src/trpc/server.ts [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "HydrateClient": ()=>HydrateClient,
    "api": ()=>api
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$server$2d$only$2f$empty$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/server-only/empty.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$trpc$2f$react$2d$query$2f$dist$2f$rsc$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@trpc/react-query/dist/rsc.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$root$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/api/root.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/api/trpc.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$trpc$2f$query$2d$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/trpc/query-client.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */ const createContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cache"])(async ()=>{
    const heads = new Headers(await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])());
    heads.set("x-trpc-source", "rsc");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$trpc$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createTRPCContext"])({
        headers: heads
    });
});
const getQueryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cache"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$trpc$2f$query$2d$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createQueryClient"]);
const caller = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$api$2f$root$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createCaller"])(createContext);
const { trpc: api, HydrateClient } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$trpc$2f$react$2d$query$2f$dist$2f$rsc$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createHydrationHelpers"])(caller, getQueryClient);
}),
"[project]/src/components/auth/AuthStatus.tsx [app-rsc] (client reference proxy) <module evaluation>": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "AuthStatus": ()=>AuthStatus
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AuthStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AuthStatus() from the server but AuthStatus is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/auth/AuthStatus.tsx <module evaluation>", "AuthStatus");
}),
"[project]/src/components/auth/AuthStatus.tsx [app-rsc] (client reference proxy)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "AuthStatus": ()=>AuthStatus
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AuthStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AuthStatus() from the server but AuthStatus is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/auth/AuthStatus.tsx", "AuthStatus");
}),
"[project]/src/components/auth/AuthStatus.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$AuthStatus$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/auth/AuthStatus.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$AuthStatus$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/auth/AuthStatus.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$AuthStatus$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript)": ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s({
    "default": ()=>Home
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$_components$2f$post$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/_components/post.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$trpc$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/trpc/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$AuthStatus$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/auth/AuthStatus.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
async function Home() {
    const hello = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$trpc$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"].post.hello({
        text: "from tRPC"
    });
    void __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$trpc$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["api"].post.getLatest.prefetch();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$trpc$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HydrateClient"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "container flex flex-col items-center justify-center gap-12 px-4 py-16",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-5xl font-extrabold tracking-tight sm:text-[5rem]",
                        children: [
                            "Create ",
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[hsl(280,100%,70%)]",
                                children: "T3"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 17,
                                columnNumber: 20
                            }, this),
                            " App"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 16,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                className: "flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20",
                                href: "https://create.t3.gg/en/usage/first-steps",
                                target: "_blank",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-2xl font-bold",
                                        children: "First Steps →"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 25,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-lg",
                                        children: "Just the basics - Everything you need to know to set up your database and authentication."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 26,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 20,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                className: "flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20",
                                href: "https://create.t3.gg/en/introduction",
                                target: "_blank",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-2xl font-bold",
                                        children: "Documentation →"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 36,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-lg",
                                        children: "Learn more about Create T3 App, the libraries it uses, and how to deploy it."
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 37,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 31,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 19,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-2xl text-white",
                            children: hello ? hello.greeting : "Loading tRPC query..."
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 44,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 43,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl bg-white/10 p-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$auth$2f$AuthStatus$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AuthStatus"], {}, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 50,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 49,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$_components$2f$post$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LatestPost"], {}, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 53,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 15,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 14,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)": ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)": ((__turbopack_context__) => {

var { m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__8b90f0d2._.js.map
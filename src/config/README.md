# config

Typed, validated configuration. `env.ts` parses `process.env` through Zod schemas and exposes
memoized, strongly-typed accessors (`getServerEnv`, `getClientEnv`). No secret, URL or token is
ever hardcoded — everything is read and validated here.

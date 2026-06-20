# lib

Infrastructure and cross-cutting concerns: the centralized `logger`, the database client, and
external integrations. Code here may have side effects and talk to the outside world — keep pure
domain logic in `server/` and `utils/` instead.

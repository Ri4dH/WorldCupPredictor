# CLAUDE.md

# AI World Cup 2026 Predictor

Version: 1.0

This file defines the engineering standards, architecture principles, coding standards, development workflow, and implementation rules for this repository.

Every task performed inside this repository MUST follow this document.

If another document conflicts with this file, this file takes precedence unless explicitly stated.

---

# Project Mission

Build one of the highest-quality FIFA World Cup 2026 prediction platforms available.

The application should combine:

• Statistical modeling
• Machine Learning
• Expected Goals (xG)
• Elo Ratings
• Monte Carlo Simulation
• Historical data
• Live tournament data

to generate predictions that are:

- Explainable
- Fast
- Reliable
- Reproducible
- Continuously improving

The application must feel like a commercial product rather than a student project.

Everything should prioritize:

Accuracy > Maintainability > Performance > Features.

---

# Core Principles

## Principle 1

Never sacrifice code quality for speed.

If something takes longer but produces significantly cleaner architecture, choose the cleaner architecture.

---

## Principle 2

Never duplicate code.

Follow the DRY principle.

---

## Principle 3

Every function should have one responsibility.

---

## Principle 4

Small reusable components are preferred over large monolithic files.

---

## Principle 5

Avoid premature optimization.

Optimize only after correctness.

---

## Principle 6

Every important decision should be documented.

---

## Principle 7

Never hardcode values that belong in configuration files.

---

## Principle 8

Type safety is mandatory.

Use strict TypeScript.

Never use "any" unless absolutely unavoidable.

---

## Principle 9

Accessibility matters.

Every page must meet WCAG AA guidelines.

---

## Principle 10

The project should remain deployable entirely using free services.

---

# Technology Stack

Frontend

- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- TanStack Query
- React Hook Form
- Zod
- Recharts

Backend

- Next.js API Routes
- Prisma ORM

Database

- PostgreSQL
- Neon

Authentication

- Auth.js (NextAuth)

Deployment

- Vercel

Background Jobs

- GitHub Actions

Storage

- Cloudinary (images if needed)

Version Control

- GitHub

Testing

- Vitest
- Playwright

Linting

- ESLint

Formatting

- Prettier

---

# Folder Structure

The project MUST follow this structure.

src/

app/

components/

features/

hooks/

lib/

services/

types/

utils/

styles/

config/

server/

prisma/

scripts/

tests/

public/

No unnecessary folders.

---

# Component Rules

Each component should:

Contain one responsibility.

Have its own folder if complexity increases.

Example

Button/

Button.tsx

Button.test.tsx

Button.types.ts

index.ts

---

# Naming Conventions

Components

PascalCase

MatchCard.tsx

Hooks

camelCase

usePrediction.ts

Utilities

camelCase

calculateElo.ts

Database Models

PascalCase

Prediction

Match

Team

Player

Files should have descriptive names.

Avoid abbreviations.

---

# Code Style

Prefer pure functions.

Prefer composition over inheritance.

Avoid nested conditionals.

Avoid files larger than 300 lines.

Avoid components larger than 250 lines.

Avoid functions larger than 40 lines.

Extract reusable logic.

---

# State Management

Prefer:

Server Components

↓

React Query

↓

Local State

↓

Context

Avoid global state unless necessary.

---

# Error Handling

Every API route must return

success

error

message

data

Example

{
success:true,
data:{}
}

Errors must never expose internal implementation.

---

# Logging

Create a centralized logger.

Development

Detailed logs.

Production

Minimal logs.

Never log secrets.

---

# Environment Variables

Never hardcode:

API Keys

Database URLs

Secrets

Tokens

Passwords

Everything belongs in .env

---

# Security

Validate every request.

Sanitize inputs.

Use parameterized queries.

Prevent:

SQL Injection

XSS

CSRF

Rate limit APIs.

---

# Performance Goals

Lighthouse

95+

Performance

95+

Accessibility

100

SEO

100

Best Practices

100

---

# Database Rules

Use Prisma.

No raw SQL unless necessary.

Every relation should have indexes.

Soft delete whenever appropriate.

Use UUIDs.

---

# API Rules

REST only.

Version APIs.

Example

/api/v1/

Never break old endpoints.

---

# Prediction Engine

The prediction engine is the most important part of the project.

It should consist of multiple independent models.

1.

Poisson Goal Model

2.

Elo Rating Model

3.

Expected Goals Model

4.

Gradient Boosted Trees

(XGBoost or LightGBM)

5.

Logistic Regression

6.

Bayesian Updates

7.

Monte Carlo Simulation

Each model should produce independent probabilities.

The final prediction is a weighted ensemble.

Never rely on a single algorithm.

---

# Explainability

Every prediction must include:

Most influential statistics

Current form impact

Injury impact

Elo difference

Expected Goals difference

Recent performance

Tournament context

Users should understand WHY the prediction exists.

---

# User Interface

Design language

Modern

Minimal

Premium

Dark mode first.

Responsive.

Fast.

Accessible.

Animation should enhance UX without reducing performance.

---

# Charts

Interactive.

Responsive.

Animated.

Readable.

No unnecessary decorations.

---

# Git Workflow

Feature branches.

Small commits.

Meaningful commit messages.

Example

feat(predictions): add poisson model

fix(api): validate match ids

refactor(ui): split match card

---

# Before Every Task

Claude must:

Understand the request.

Read relevant documentation.

Create a plan.

Estimate affected files.

Implement.

Test.

Lint.

Refactor if needed.

Document changes.

---

# Testing Requirements

Every important feature needs:

Unit Tests

Integration Tests

End-to-End Tests

Critical prediction logic should have >90% coverage.

---

# Documentation

Every major folder should contain:

README.md

Document architecture decisions.

---

# Things Claude Must Never Do

Never rewrite unrelated files.

Never remove comments without reason.

Never introduce breaking changes.

Never ignore TypeScript errors.

Never disable ESLint.

Never leave TODOs unfinished.

Never generate placeholder code if production code is possible.

Never duplicate logic.

Never commit secrets.

Never ignore failing tests.

---

# Definition of Done

A task is complete only if:

✓ Code compiles

✓ Lint passes

✓ Tests pass

✓ Types pass

✓ Documentation updated

✓ Responsive

✓ Accessible

✓ Production ready

If any item fails, the task is NOT complete.

---

# Long-Term Vision

The architecture should eventually support:

- UEFA Champions League
- Premier League
- La Liga
- Bundesliga
- Serie A
- Ligue 1
- Copa América
- UEFA European Championship
- AFC Asian Cup
- FIFA Club World Cup

without requiring major rewrites.

Design every system with extensibility in mind.

End of CLAUDE.md
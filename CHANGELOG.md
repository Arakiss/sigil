# Changelog

All notable changes to Sigil will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## 0.1.0 (2025-12-18)

### ⚠ BREAKING CHANGES

* Package renamed from logpulse to sigil.

- Renamed package directory from packages/logpulse to packages/sigil
- Updated package name to "sigil" with new branding
- Added comprehensive test suite (232 tests, 91% coverage)
- Updated README with new tagline: "Leave your mark"

Migration: Update imports from 'logpulse' to 'sigil'

### ✨ Features

* **demo:** add documentation site with Next.js 16 ([82f01b7](https://github.com/Arakiss/sigil/commit/82f01b7b903beaa647aca522c73c62ab131379b7))
* initial release of logpulse v1.0.0 ([4eceec4](https://github.com/Arakiss/sigil/commit/4eceec49fad2c99ea3c59a89f5bf381e8d1ca80d))
* rename package from logpulse to sigil ([fe912b6](https://github.com/Arakiss/sigil/commit/fe912b64d308739c56e3a5727a00aa8047662431))

### 🐛 Bug Fixes

* **ci:** ignore auto-generated next-env.d.ts in Biome ([dd20c61](https://github.com/Arakiss/sigil/commit/dd20c61e10be7049982159e39f552f1d00d5e42c))
* **ci:** resolve CI/CD failures and add open source essentials ([9ef8424](https://github.com/Arakiss/sigil/commit/9ef842426a09a55736a5b62c1c939ccdd9374398))
* correct version to 0.1.0 (semver pre-release) ([88c8d1f](https://github.com/Arakiss/sigil/commit/88c8d1fb835d40a1493cc783d8db3f87c90809ee))
* **release:** allow same version when syncing package version ([cb463fe](https://github.com/Arakiss/sigil/commit/cb463fe3653bdd406f9c92459a5fd72f80d5b067))
* **release:** use node script instead of npm for version sync ([a60f5e4](https://github.com/Arakiss/sigil/commit/a60f5e49eddb5a01f09d652abf3d2c2ad320cd6e))

## [0.1.0] - 2025-12-18

### ✨ Features

- **Core Logger**: Full-featured structured logging with multiple log levels (trace, debug, info, warn, error, fatal)
- **Runtime Agnostic**: Works seamlessly across Node.js, Bun, Deno, browsers, and edge runtimes
- **PII Sanitization**: Automatic detection and masking of sensitive data (emails, IPs, credit cards, etc.)
- **Context Propagation**: AsyncLocalStorage-based context that flows through async operations
- **Correlation IDs**: Automatic request tracing with correlation ID support
- **Child Loggers**: Create scoped loggers with inherited context
- **Console Transport**: Beautiful, colorized console output with emoji support
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Zero Dependencies**: Lightweight with no external runtime dependencies
- **Configurable**: Flexible configuration for log levels, formats, and sanitization rules

### 📚 Documentation

- Added demo documentation site with Next.js 16
- Getting started guide
- API reference
- Feature documentation

### 🔧 CI/CD

- GitHub Actions workflow for CI (linting, testing, building)
- Automated release pipeline with conventional commits
- Security scanning

[0.1.0]: https://github.com/Arakiss/sigil/releases/tag/v0.1.0

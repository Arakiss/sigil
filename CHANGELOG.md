# Changelog

All notable changes to Sigil will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

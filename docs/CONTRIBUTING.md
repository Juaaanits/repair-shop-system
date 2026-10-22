# Contributing

See the [README](../README.md) for setup, commands, and architecture. The [MVP plan](mvp-plan.md) defines scope and milestone acceptance criteria.

## Development workflow

1. Create a short-lived branch for one milestone or focused maintenance change.
2. Keep changes small and follow the layering and security rules in [AGENTS.md](../AGENTS.md).
3. Run the validation commands in the README and perform the relevant manual checks from the MVP plan.
4. Review all staged files, including newly added files, before committing.
5. Open a pull request to `main` describing the resulting behavior, validation results, and remaining limitations.
6. Merge after review and milestone acceptance. Update the local baseline before starting the next milestone.

Record test output, verification evidence, and environment-specific troubleshooting in pull requests or issues. Do not commit generated reports, development diaries, or session transcripts. Keep durable setup and architecture guidance in the README.

## Repository policy

Commit source, configuration, the npm lockfile, SQL migrations and Drizzle metadata, sanitized environment templates, product documentation, and shared project instructions and skills.

Exclude credentials, real environment files, generated output, logs, personal tool settings, database backups, and customer exports. Use fictional data in tests and examples. Review reference files and documentation for private details before publishing.

Ignoring a file does not remove it from Git history. Rotate exposed credentials and address the repository history separately when necessary.

## Maintenance

Update documentation when supported behavior, commands, or architecture changes. Keep dependency updates deliberate, inspect lockfile diffs and audit findings, and rerun relevant checks. Do not apply forced dependency fixes without assessing compatibility.

CI/CD configuration is outside the present scope. Local validation and review remain required.

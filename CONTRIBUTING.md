# Contributing

Use Node 24 and pnpm 12.4.2, as pinned in this repository.

```sh
pnpm install --frozen-lockfile
pnpm preflight
pnpm audit --audit-level=high
```

Keep each change focused and explain the behavior it changes. Include the commands
you ran and any checks you could not complete. Tests should cover observable
behavior, including missing data, source dates, money units and keyboard access.

For visual changes, include screenshots and check the illustrated fallback,
reduced motion, narrow screens and keyboard navigation. Use synthetic reference
amounts in screenshots. Do not commit browser profiles, credentials or personal
financial information.

Read [AGENTS.md](AGENTS.md) for the current architecture and rendering constraints.
Historical local development plans are not the current product contract.

Contributions to the repository source use the [MIT license](LICENSE). Third-party
assets and external data retain their own terms. Do not add assets or data unless
you have permission to redistribute them.

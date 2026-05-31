# Contributing

Thanks for considering a contribution.

## Good first changes

- Add tests for policy edge cases.
- Improve command catalog metadata.
- Keep dashboard serialization behavior backward compatible.

## Local validation

```bash
npm ci
npm run typecheck
npm test
```

## Pull requests

- Explain the policy behavior or catalog metadata being changed.
- Include tests when command enablement, policy targets, or permission behavior changes.
- Do not include Discord tokens, private guild IDs, webhook URLs, or dashboard secrets.

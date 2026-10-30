# Source readiness implementation plan

Goal: Patch the vulnerable build dependency and document contributor and security
reporting requirements for the public source repository.

The change does not alter application behavior. The lockfile moves source-map-js
from 1.2.1 to the compatible patched 1.2.2 release. CI checks the full dependency
tree for high and critical advisories.

1. Update only source-map-js in the frozen lockfile.
2. Add contributor instructions and truthful security reporting status.
3. Run frozen installation, preflight and dependency audit using Node 24.
4. Run a redacted complete-history secret scan and review the diff.
5. Obtain independent review, commit, push and update the existing PR.

The owner approved MIT for the repository source. Private vulnerability reporting
was enabled through GitHub and verified on 13 October 2026. This does not change
the repository's default branch or merge the license into it.

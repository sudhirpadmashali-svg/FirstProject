# Release Notes Automation (Sample Project)

A small, dependency-free example of automating release notes from git
history, built to demonstrate a real Claude Code workflow: a script, tests,
and a CI/CD pipeline that ties them together.

## How it works

1. Commits in this repo are expected to (loosely) follow the
   [Conventional Commits](https://www.conventionalcommits.org/) format:

   ```
   <type>(<optional scope>): <description>
   ```

   Examples: `feat(auth): add login support`, `fix: correct off-by-one error`,
   `feat!: drop support for Python 2` (the `!` marks a breaking change).

2. `generate_release_notes.py` reads `git log` between two refs, groups the
   commits by type (Features, Bug Fixes, Docs, ...), and renders Markdown.
   Commits that don't match the convention are grouped under "Other Changes"
   instead of being dropped.

3. `.github/workflows/release-notes.yml` runs the script automatically
   whenever a tag like `v1.2.0` is pushed: it finds the previous tag, diffs
   the commits between them, and publishes a GitHub Release with the
   generated notes.

4. `.github/workflows/tests.yml` runs the test suite on every push/PR to
   `main` so changes to the script itself stay covered.

## Usage

Generate notes for everything since the last tag:

```bash
python generate_release_notes.py --version v1.2.0 --since v1.1.0
```

Generate notes across the entire history (first release):

```bash
python generate_release_notes.py --version v1.0.0
```

Write straight to a file instead of stdout:

```bash
python generate_release_notes.py --version v1.2.0 --since v1.1.0 --output RELEASE_NOTES.md
```

## Cutting a real release

Push a tag matching `v*.*.*` and the `release-notes.yml` workflow takes care
of the rest:

```bash
git tag v1.0.0
git push origin v1.0.0
```

That creates a GitHub Release for `v1.0.0` with categorized notes generated
from every commit up to that tag.

## Running the tests locally

```bash
pip install -r requirements-dev.txt
pytest -v
```

## Project layout

```
generate_release_notes.py          # the script: parses git log, categorizes, renders Markdown
tests/test_generate_release_notes.py  # unit tests for parsing/categorizing/rendering
.github/workflows/tests.yml        # CI: runs pytest on push/PR
.github/workflows/release-notes.yml # CD: publishes a GitHub Release when a vX.Y.Z tag is pushed
CHANGELOG.md                       # human-readable log; new entries are generated per release
```

## Extending this with Claude Code

This is intentionally minimal so it's easy to build on. Some natural next
steps you could ask Claude Code to help with:

- Pull PR titles/labels from the GitHub API instead of raw commit subjects.
- Group by GitHub labels (`bug`, `enhancement`) in addition to commit type.
- Auto-prepend each generated release section into `CHANGELOG.md`.
- Post the generated notes to Slack when a release goes out.

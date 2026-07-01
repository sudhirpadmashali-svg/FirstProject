#!/usr/bin/env python3
"""Generate categorized release notes from git commit history.

Groups commits since a given tag (or the start of history) by
Conventional Commits type (feat, fix, docs, ...) and renders them as
Markdown suitable for a GitHub Release or a CHANGELOG.md entry.

Usage:
    python generate_release_notes.py --version v1.2.0
    python generate_release_notes.py --version v1.2.0 --since v1.1.0
    python generate_release_notes.py --version v1.2.0 --since v1.1.0 --output RELEASE_NOTES.md
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from collections import defaultdict
from datetime import date

CATEGORY_TITLES = {
    "feat": "Features",
    "fix": "Bug Fixes",
    "perf": "Performance Improvements",
    "refactor": "Code Refactoring",
    "docs": "Documentation",
    "test": "Tests",
    "build": "Build System",
    "ci": "Continuous Integration",
    "chore": "Chores",
    "revert": "Reverts",
    "other": "Other Changes",
}

CATEGORY_ORDER = [
    "feat", "fix", "perf", "refactor", "docs", "test", "build", "ci",
    "chore", "revert", "other",
]

COMMIT_PATTERN = re.compile(
    r"^(?P<type>\w+)(?:\((?P<scope>[^)]+)\))?(?P<breaking>!)?:\s*(?P<subject>.+)$"
)


def get_commits(since_ref: str | None) -> list[str]:
    """Return 'hash|subject' lines for commits since since_ref (or all history)."""
    commit_range = f"{since_ref}..HEAD" if since_ref else "HEAD"
    result = subprocess.run(
        ["git", "log", commit_range, "--pretty=format:%h|%s", "--no-merges"],
        capture_output=True,
        text=True,
        check=True,
    )
    return [line for line in result.stdout.splitlines() if line.strip()]


def categorize(commits: list[str]) -> dict[str, list[tuple[str, str, bool]]]:
    """Group commits by Conventional Commit type.

    Returns a dict of category -> list of (short_hash, description, is_breaking).
    Commits that don't follow the convention fall into "other".
    """
    categorized: dict[str, list[tuple[str, str, bool]]] = defaultdict(list)
    for line in commits:
        commit_hash, _, subject = line.partition("|")
        match = COMMIT_PATTERN.match(subject)
        if match:
            commit_type = match.group("type").lower()
            scope = match.group("scope")
            breaking = bool(match.group("breaking"))
            description = match.group("subject")
            if scope:
                description = f"**{scope}:** {description}"
            category = commit_type if commit_type in CATEGORY_TITLES else "other"
        else:
            category = "other"
            description = subject
            breaking = False
        categorized[category].append((commit_hash, description, breaking))
    return categorized


def render_markdown(categorized: dict, version: str) -> str:
    lines = [f"## {version} ({date.today().isoformat()})", ""]

    breaking_changes = [
        (h, d) for items in categorized.values() for h, d, brk in items if brk
    ]
    if breaking_changes:
        lines.append("### ⚠ BREAKING CHANGES")
        lines.append("")
        for commit_hash, description in breaking_changes:
            lines.append(f"- {description} ({commit_hash})")
        lines.append("")

    any_notes = False
    for category in CATEGORY_ORDER:
        items = categorized.get(category)
        if not items:
            continue
        any_notes = True
        lines.append(f"### {CATEGORY_TITLES[category]}")
        lines.append("")
        for commit_hash, description, _ in items:
            lines.append(f"- {description} ({commit_hash})")
        lines.append("")

    if not any_notes:
        lines.append("No changes.")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--version", required=True,
        help="Version label for this release, e.g. v1.2.0",
    )
    parser.add_argument(
        "--since", default=None,
        help="Git ref to generate notes since (tag, commit, branch). "
             "Defaults to the entire history.",
    )
    parser.add_argument(
        "--output", default=None,
        help="File to write the notes to. Defaults to stdout.",
    )
    args = parser.parse_args(argv)

    try:
        commits = get_commits(args.since)
    except subprocess.CalledProcessError as exc:
        print(f"error: failed to read git history: {exc}", file=sys.stderr)
        return 1

    categorized = categorize(commits)
    notes = render_markdown(categorized, args.version)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(notes)
    else:
        print(notes)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

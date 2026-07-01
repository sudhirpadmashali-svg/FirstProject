import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from generate_release_notes import categorize, render_markdown


def test_categorize_conventional_commits():
    commits = [
        "abc123|feat(auth): add login support",
        "def456|fix: correct off-by-one error",
        "ghi789|docs: update README",
        "jkl012|chore: bump dependencies",
    ]
    categorized = categorize(commits)

    assert categorized["feat"] == [("abc123", "**auth:** add login support", False)]
    assert categorized["fix"] == [("def456", "correct off-by-one error", False)]
    assert categorized["docs"] == [("ghi789", "update README", False)]
    assert categorized["chore"] == [("jkl012", "bump dependencies", False)]


def test_categorize_non_conventional_commit_falls_back_to_other():
    commits = ["abc123|Quick fix for typo"]
    categorized = categorize(commits)
    assert categorized["other"] == [("abc123", "Quick fix for typo", False)]


def test_categorize_detects_breaking_change():
    commits = ["abc123|feat!: drop support for Python 2"]
    categorized = categorize(commits)
    commit_hash, description, breaking = categorized["feat"][0]
    assert breaking is True
    assert description == "drop support for Python 2"


def test_render_markdown_includes_breaking_changes_section():
    categorized = {"feat": [("abc123", "drop support for Python 2", True)]}
    output = render_markdown(categorized, "v2.0.0")
    assert "BREAKING CHANGES" in output
    assert "Features" in output
    assert "v2.0.0" in output


def test_render_markdown_no_changes():
    output = render_markdown({}, "v1.0.1")
    assert "No changes." in output

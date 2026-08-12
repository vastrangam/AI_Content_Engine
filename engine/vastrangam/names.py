"""Names in, one identity out.

A name written in capitals, in mixed case, with a trailing space, or with one
letter transposed is still the same person. The engine never compares written
names — it compares ids, and this module is the only place a written name
becomes an id. The names themselves live in the alias table, which is data.
"""

from __future__ import annotations

import re
import unicodedata
from difflib import SequenceMatcher

_PUNCT = re.compile(r"[^a-z0-9&]+")
_TEAM = re.compile(r"\b(and|&)\b")


def normalise(text) -> str:
    """Fold a written name to a comparison key. Never shown to anyone."""
    if text is None:
        return ""
    s = unicodedata.normalize("NFKD", str(text))
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = s.strip().lower()
    s = _TEAM.sub("&", s)
    s = _PUNCT.sub(" ", s).strip()
    return re.sub(r"\s+", " ", s)


def similarity(a: str, b: str) -> float:
    return SequenceMatcher(None, normalise(a), normalise(b)).ratio()


class AliasTable:
    """alias -> id. Everything else in the engine keys off the id it returns."""

    def __init__(self):
        self._by_alias: dict[str, str] = {}
        self._aliases: dict[str, set[str]] = {}
        self._display: dict[str, str] = {}

    def register(self, ident: str, *aliases, display: str | None = None) -> str:
        """Bind an id to its written forms. The first alias becomes the label."""
        self._display.setdefault(ident, display or (aliases[0] if aliases else ident))
        if display:
            self._display[ident] = display
        for alias in (ident, *aliases):
            key = normalise(alias)
            if not key:
                continue
            existing = self._by_alias.get(key)
            if existing and existing != ident:
                raise ValueError(
                    f"alias {alias!r} already points at {existing!r}, cannot also mean {ident!r}"
                )
            self._by_alias[key] = ident
            self._aliases.setdefault(ident, set()).add(key)
        return ident

    def lookup(self, name) -> str | None:
        return self._by_alias.get(normalise(name))

    def display(self, ident: str) -> str:
        return self._display.get(ident, ident)

    def ids(self) -> list[str]:
        return sorted(self._aliases)

    def aliases(self, ident: str) -> list[str]:
        return sorted(self._aliases.get(ident, ()))

    def propose(self, name, threshold: float = 0.86) -> list[tuple[str, float]]:
        """Near matches, ranked. Proposed — never applied. A merge is a decision."""
        key = normalise(name)
        scored = [
            (ident, max(SequenceMatcher(None, key, a).ratio() for a in aliases))
            for ident, aliases in self._aliases.items()
            if aliases
        ]
        return sorted(
            [(i, round(s, 3)) for i, s in scored if s >= threshold],
            key=lambda x: -x[1],
        )

    def to_json(self) -> dict:
        return {
            ident: {"display": self.display(ident), "aliases": self.aliases(ident)}
            for ident in self.ids()
        }

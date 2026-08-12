"""Vastrangam staff and karigar engine.

The rules live here. The data does not. Nothing in this package names a person,
a date or a rate — every decision resolves from effective-dated master data at
run time, so a correction to a source file is a re-run, never a code change.
"""

from .allocation import DesignCost, WorkRow, allocate, cost_per_piece_table
from .attendance import DEFAULT_CODES, AttendanceBook, read_code
from .calendar_util import Month, fy_months, fy_of, parse_date
from .gates import GateResult, all_passed, report
from .karigar import KarigarRegistry, Ledger, complete_sets, pool, roll_up, weighted_rate
from .logs import Ambiguous, EffectiveLog, SpellLog, Unresolved
from .master import ATTENDANCE, FLAT, PIECE_RATE, Master
from .names import AliasTable, normalise
from .pay import (EMPLOYED, NOT_EMPLOYED, NO_DATA, UNRESOLVED, MonthPay,
                  blended_hourly, fy_pay, month_pay, total_payroll)
from .performance import summarise
from .runlog import RunLog

__version__ = "1.0.0"

__all__ = [
    "Master", "AttendanceBook", "Month", "EffectiveLog", "SpellLog",
    "Unresolved", "Ambiguous", "AliasTable", "normalise",
    "month_pay", "fy_pay", "blended_hourly", "total_payroll", "MonthPay",
    "FLAT", "ATTENDANCE", "PIECE_RATE",
    "EMPLOYED", "NO_DATA", "NOT_EMPLOYED", "UNRESOLVED",
    "summarise", "allocate", "WorkRow", "DesignCost", "cost_per_piece_table",
    "KarigarRegistry", "pool", "complete_sets", "weighted_rate", "roll_up", "Ledger",
    "GateResult", "report", "all_passed", "RunLog",
    "DEFAULT_CODES", "read_code", "parse_date", "fy_months", "fy_of",
    "__version__",
]

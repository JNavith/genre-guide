#    genre.guide - From Google Sheets to Redis: Google Sheets notes utilities Python file
#    Copyright (C) 2020 Navith
#
#    This program is free software: you can redistribute it and/or modify
#    it under the terms of the GNU Affero General Public License as published by
#    the Free Software Foundation, either version 3 of the License, or
#    (at your option) any later version.
#
#    This program is distributed in the hope that it will be useful,
#    but WITHOUT ANY WARRANTY; without even the implied warranty of
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#    GNU Affero General Public License for more details.
#
#    You should have received a copy of the GNU Affero General Public License
#    along with this program. If not, see <https://www.gnu.org/licenses/>.


from os import getenv
from typing import Dict, Generator, List

from gspread import Spreadsheet, Worksheet
from gspread.utils import rowcol_to_a1
from gspread_formatting import CellFormatComponent


class Notes(CellFormatComponent):
    _FIELDS = ...


def get_notes(worksheet: Worksheet, row_start: int, col_start: int,
              row_end: int, col_end: int) -> Generator[List[str], None, None]:
    label: str = f"{worksheet.title}!{rowcol_to_a1(row_start, col_start)}:{rowcol_to_a1(row_end, col_end)}"

    resp: Dict = worksheet.spreadsheet.fetch_sheet_metadata({
        "includeGridData":
        True,
        "ranges": [label],
        "fields":
        "sheets.data.rowData.values.note"
    })

    this_sheets_data = resp["sheets"][0]["data"][0]

    for row_num, row in enumerate(this_sheets_data["rowData"],
                                  start=row_start):
        this_rows_notes: List[str] = []

        for col_num, cell_info in enumerate(row.get("values", []),
                                            start=col_start):
            note: str = cell_info.get("note")
            this_rows_notes.append(note)

        yield this_rows_notes


if __name__ == "__main__":
    from . import open_google_sheet

    genre_sheet: Spreadsheet = open_google_sheet()
    genres_tab: Worksheet = genre_sheet.worksheet(getenv("GENRES_SHEET_NAME"))

    for row_num, row in enumerate(get_notes(genres_tab,
                                            row_start=1,
                                            col_start=1,
                                            row_end=25,
                                            col_end=12),
                                  start=1):
        for col_num, note in enumerate(row, start=1):
            if note is not None:
                print((row_num, col_num), "-", note)

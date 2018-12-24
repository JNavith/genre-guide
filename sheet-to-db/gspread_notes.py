from os import getenv
from typing import Dict, Generator, List

from gspread import Spreadsheet, Worksheet
from gspread.utils import rowcol_to_a1
from gspread_formatting import CellFormatComponent


class Notes(CellFormatComponent):
	_FIELDS = ...


def get_notes(worksheet: Worksheet, row_start: int, col_start: int, row_end: int, col_end: int) -> Generator[List[str], None, None]:
	label: str = f"{worksheet.title}!{rowcol_to_a1(row_start, col_start)}:{rowcol_to_a1(row_end, col_end)}"
	
	resp: Dict = worksheet.spreadsheet.fetch_sheet_metadata({
		"includeGridData": True,
		"ranges": [label],
		"fields": "sheets.data.rowData.values.note"
	})
	
	this_sheets_data = resp["sheets"][0]["data"][0]
	
	for row_num, row in enumerate(this_sheets_data["rowData"], start=row_start):
		this_rows_notes: List[str] = []
		
		for col_num, cell_info in enumerate(row.get("values", []), start=col_start):
			note: str = cell_info.get("note")
			this_rows_notes.append(note)
		
		yield this_rows_notes


if __name__ == "__main__":
	from .__main__ import open_genre_sheet
	
	genre_sheet: Spreadsheet = open_genre_sheet()
	genres_tab: Worksheet = genre_sheet.worksheet(getenv("GENRES_SHEET_NAME"))
	
	for row_num, row in enumerate(get_notes(genres_tab, row_start=1, col_start=1, row_end=25, col_end=12), start=1):
		for col_num, note in enumerate(row, start=1):
			if note is not None:
				print((row_num, col_num), "-", note)

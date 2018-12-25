from collections import defaultdict
from itertools import count
from json import dumps, loads
from os import getenv
from typing import Any, Awaitable, DefaultDict, Dict, Generator, Iterator, List, Set, Tuple

from aioredis.commands import MultiExec, Redis
from gspread import Spreadsheet, Worksheet
from gspread.utils import rowcol_to_a1
from gspread_formatting import CellFormat


def get_effective_formats(worksheet: Worksheet, row_start: int, col_start: int, row_end: int, col_end: int) -> Generator[List[CellFormat], None, None]:
	"""Matrix equivalent of gspread-formatting's get_effective_format which only works on one cell
	   Rationale: Quota limits for large sheets (AKA what we have)"""
	
	label: str = f"{worksheet.title}!{rowcol_to_a1(row_start, col_start)}:{rowcol_to_a1(row_end, col_end)}"
	
	resp: Dict = worksheet.spreadsheet.fetch_sheet_metadata({
		"includeGridData": True,
		"ranges": [label],
		"fields": "sheets.data.rowData.values.effectiveFormat"
	})
	
	this_sheets_data = resp["sheets"][0]["data"][0]
	
	for row_num, row in enumerate(this_sheets_data["rowData"], start=row_start):
		this_rows_formats: List[CellFormat] = []
		
		for col_num, cell_info in enumerate(row["values"], start=col_start):
			props = cell_info.get("effectiveFormat")
			
			if props.pop("borders", None) is not None:
				print("removed borders to prevent error creating CellFormat object")
			
			cell_format = CellFormat.from_props(props) if props is not None else None
			this_rows_formats.append(cell_format)
		
		yield this_rows_formats


def get_genre_colors(genre_sheet: Spreadsheet) -> Dict[str, str]:
	"""Maps the name of a genre to its hex color"""
	
	genre_info_tab: Worksheet = genre_sheet.worksheet(getenv("GENRE_INFO_SHEET_NAME"))
	
	genre_to_color: Dict[str, str] = {}
	
	all_records: List[Dict] = genre_info_tab.get_all_records()
	for (row_num, record) in enumerate(all_records):
		name: str = record["Genre"]
		
		if name in {"?", "Spare Color", "Total"}:
			continue
		
		# Keep climbing until the cell that contains the color is found
		# Done for genres that share colors and thus have a merged cell
		# E.x. Ambient and Atmospheric, Pop and Disco
		# Or it just works right away for unmerged cells
		for i in count(start=0):
			hex_color: str = all_records[row_num - i]["Color (#Hex)"]
			
			if hex_color:
				break
		else:
			# Manually intervene to see what the problem is
			breakpoint()
		
		genre_to_color[name] = hex_color
	
	return genre_to_color


def build_up_subgenre_information(genre_sheet: Spreadsheet) -> Dict[str, Dict[str, Any]]:
	"This thing is frightening."
	
	genres_tab: Worksheet = genre_sheet.worksheet(getenv("GENRES_SHEET_NAME"))
	
	entries: Iterator[List[str]] = iter(genres_tab.get_all_values())
	# Not necessary for now, but it does advance the iterator which is important
	header: List[str] = [label.lower() for label in next(entries)]
	
	row_start: int = 2
	col_start: int = 1
	row_end: int = genres_tab.row_count
	col_end: int = 8
	
	all_formats = list(get_effective_formats(genres_tab, row_start=row_start, col_start=col_start, row_end=row_end, col_end=col_end))
	
	# All genres (not subgenres)
	genres: Set[str] = set()
	
	# All subgenres (including genres)
	subgenres: Set[str] = set()
	
	# Used to track the parents in the moment (very frequently overwritten)
	# It's a mapping of the column number to the row number and subgenre / genre
	hierarchy: Dict[int, Tuple[int, str]] = {}
	
	# The set of the parents to the subgenre or genre in question
	# A simplistic example is "Hard Trap": {"Rawstyle", "Hybrid Trap"}
	# Or "Future Bass": {"Trap (EDM)", "Wonky", "Electronic Dance Music", "Purple Sound"}
	origins: Dict[str, Set[str]] = defaultdict(set)
	
	# Map of subgenre to the genre whose color it inherits
	# E.x. "Ambient Pop": "Ambient"
	# E.x. "Vaportrap": "Vaporwave"
	# E.x. "Future Bass": "Future Bass"
	subgenre_to_genre: Dict[str, str] = {}
	
	row_num: int
	row: List[str]
	col_num: int
	subgenre: str
	for row_num, row in enumerate(entries, start=row_start):
		for col_num, subgenre in enumerate(row, start=col_start):
			# Skip empty cells
			if not subgenre:
				continue
			
			# We found a genre (as opposed to a subgenre)
			if col_num == col_start:
				# Be confident that all genres are bold
				if __debug__ and not any(cell_format.textFormat.bold for cell_format in all_formats[row_num - row_start]):
					# Manually intervene to find the problem
					breakpoint()
				
				# Add it to the genres set
				genres.add(subgenre)
			
			# Update the hierarchy information
			hierarchy[col_num]: Tuple[int, str] = (row_num, subgenre)
			
			# Because we're working with a defaultdict, this will find or create the set
			this_subgenres_origins: Set[str] = origins[subgenre]
			
			# Add origin information for subgenres only (because there will be an index error for genres at the left-most column
			if col_num > col_start:
				parent_row, parent_subgenre = hierarchy[col_num - 1]
				
				# Last entry in the format list for this row (this assumes the cells are properly merged)
				parent_format = all_formats[parent_row - row_start][-1]
				
				# Be confident that there are no subgenres of strikethroughed or italicized subgenres / genres
				if __debug__ and (parent_format.textFormat.strikethrough or parent_format.textFormat.italic):
					# Manually intervene to see the problem
					breakpoint()
				
				# Add the parent to this subgenre's origins
				this_subgenres_origins.add(parent_subgenre)
			
			# If this subgenre belongs to this genre without being italicized or strikethroughed,
			# then it takes on its color
			subgenre_format = all_formats[row_num - row_start][-1]
			if not subgenre_format.textFormat.strikethrough and not subgenre_format.textFormat.italic:
				subgenre_to_genre[subgenre] = hierarchy[1][1]
			
			# Finally, add this to the list of subgenres
			subgenres.add(subgenre)
			
			# And move onto the next row
			break
	
	# Skip checks outside of debug mode (aka where assertions don't mean anything)
	if __debug__:
		# Be confident that every subgenre has origins and belongs to a genre / has a color
		for subgenre in subgenres:
			if subgenre not in subgenre_to_genre or subgenre not in origins:
				# Manually intervene to see the problem
				breakpoint()
		
		for subgenre in subgenre_to_genre:
			if not len(origins[subgenre]):
				print(subgenre, "has no origin, if you were curious")
	
	# Finally, create a composite piece of data (for loading into Redis)
	full_data: Dict[str, Dict[str, Any]] = defaultdict(dict)
	
	genre_to_color: Dict[str, str] = get_genre_colors(genre_sheet)
	
	# Make sure the genres found in the genres tab matches the list
	# of genres from the genre stats tab
	if __debug__ and set(genre_to_color) != set(genres):
		# Manually intervene to see the problem
		breakpoint()
	
	for subgenre, parents in origins.items():
		full_data[subgenre]["name"] = subgenre
		full_data[subgenre]["origins"] = tuple(parents)
		full_data[subgenre]["genre"] = subgenre_to_genre[subgenre]
		
		for parent in parents:
			# Includes derivatives (the only difference is that derivatives are genres)
			full_data[parent].setdefault("subgenres", set()).add(subgenre)
		
		is_genre: bool = subgenre in genres
		full_data[subgenre]["is_genre"] = dumps(is_genre)
		full_data[subgenre]["color"] = dumps(genre_to_color[subgenre]) if is_genre else dumps(None)
	
	# Now that that loop above has completed, "freeze" all the origins and subgenres into a tuple, and JSON-dump them
	for subgenre, data in full_data.items():
		data["origins"] = dumps(tuple(data.get("origins", ())))
		data["subgenres"] = dumps(tuple(data.get("subgenres", ())))
	
	return full_data


def create_subgenres_data_set(subgenre_data: Dict[str, Dict[str, Any]]) -> Dict[str, List[Tuple]]:
	"Create a mapping (basically just a list with some names) in preparation for Redis actions"
	
	actions: DefaultDict[str, List[Tuple]] = defaultdict(list)
	
	for subgenre, data in subgenre_data.items():
		# Add all the fields of the genre to the database by its name
		actions["subgenre_by_name"].append((f"subgenre:{subgenre}", data))
	
	# pprint((subgenre, data))
	
	# Add to the set of all subgenres
	# actions["all_subgenres"].append((f"{subgenre}",))
	# Not necessary - I am doing this in the same loop as `subgenre_by_name` in the function below 
	
	return actions


async def seed_redis_with_subgenre_data(redis: Redis, subgenre_data_set: Dict[str, List[Tuple]]) -> List[Awaitable]:
	awaitables: List[Awaitable] = []
	
	# Group by 100 operations
	actions_per_transaction: int = 100
	# Initial transaction object (will be overwritten every `actions_per_transaction` loops)
	transaction: MultiExec = redis.multi_exec()
	
	index: int = -1
	for index, (subgenre_name, dictionary) in enumerate(subgenre_data_set["subgenre_by_name"], start=index + 1):
		# Compared against `actions_per_transaction-1` so that the first transaction isn't empty
		# (there must be a better way)
		if (index % actions_per_transaction) == (actions_per_transaction - 1):
			awaitables.append(transaction.execute())
			# Create a new transaction
			transaction: MultiExec = redis.multi_exec()
		
		transaction.hmset_dict(subgenre_name, dictionary)
		
		# Though this "should" have its own loop, I will just do it here
		transaction.sadd("subgenres", dictionary["name"])
		
		# This too
		if loads(dictionary["is_genre"]):
			transaction.sadd("genres", dictionary["name"])
	
	# Add leftovers (that didn't make it into a group)
	awaitables.append(transaction.execute())
	
	return awaitables

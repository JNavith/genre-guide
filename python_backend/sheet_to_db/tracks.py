#    genre.guide - From Google Sheets to Firestore: Tracks
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

from bisect import bisect_left, bisect_right
from collections import defaultdict
from collections.abc import Sequence
from datetime import date, datetime
from itertools import chain, groupby
from json import dumps
from operator import itemgetter
from parse import parse
from typing import Awaitable, DefaultDict, Dict, Generator, Iterable, Iterator, List, Optional, Set, Tuple, TypedDict, cast
from warnings import warn

from gspread import Spreadsheet, Worksheet

from ..genre_utils import flatten_subgenres, parse_genre, unordered_subgenres_and_operators
from ..track_utils import id_for_track
from . import FirestoreClient, GENRE_SHEET_CATALOG_SHEET_NAME, GENRE_SHEET_KEY, get_firestore, get_genre_sheet, get_subgenre_sheet, SUBGENRE_SHEET_KEY


class Track(TypedDict):
	genre: str
	subgenre: str

	artist: str
	title: str
	record_label: str
	
	release_date: str

	length: Optional[str]
	bpm: Optional[str]
	key: Optional[str]

	source_key: str
	source_name: str
	source_tab: str
	source_row: int


# https://stackoverflow.com/a/35857036
class LazyBisectable(Sequence):
	def __init__(self, data, key, reversed: bool = False):
		self.data = data
		self.key = key
		self.reversed = reversed
	
	def __len__(self):
		return len(self.data)
	
	def __getitem__(self, i):
		return self.key(self.data[len(self.data) - i - 1 if self.reversed else i])


def genre_sheet_record_to_track(*, record: Dict[str, str], row: int, source_tab: str) -> Track:
	return {
		"genre": record["Genre"],
		"subgenre": record["Subgenre"],

		"artist": record["Artist"],
		"title": record["Track"],
		"record_label": record["Label"],

		"release_date": record["Release"],

		"length": None,
		"bpm": None,
		"key": None,

		"source_key": GENRE_SHEET_KEY,
		"source_name": "Genre Sheet",
		"source_tab": source_tab,
		"source_row": row,
	}


def subgenre_sheet_record_to_track(*, record: Dict[str, str], row: int, source_tab: str) -> Track:
	return {
		"genre": record["Genre Color"],
		"subgenre": record["Subgenres"],

		"artist": record["Artists"],
		"title": record["Song Title"],
		"record_label": record["Primary Label"],

		"release_date": record["Date"],

		"length": record["Length"] or None,
		"bpm": record["BPM"] or None,
		"key": record["Key"] or None,

		"source_key": SUBGENRE_SHEET_KEY,
		"source_name": "Subgenre Sheet",
		"source_tab": source_tab,
		"source_row": row,
	}


def clean_up_track(track: Track) -> None:
	if track["genre"] == "Trap":
		track["genre"] = "Trap (EDM)"

	# If the first subgenre in the list is unknown,
	if track["subgenre"].startswith("?"):
		# And there is a genre specified,
		if track["genre"] != "?":
			# Replace the bare ? with ? (Genre)
			track["subgenre"] = track["subgenre"].replace("?", f"? ({track['genre']})", 1)
	# Ambiguity for Trap as well
	# todo: make this happen on any subgenre in the tree
	elif track["subgenre"].startswith("Trap"):
		if track["genre"] == "Hip Hop":
			track["subgenre"] = track["subgenre"].replace("Trap", "Trap (Hip Hop)", 1)
		elif track["genre"] in {"Trap", "Trap (EDM)"}:
			track["subgenre"] = track["subgenre"].replace("Trap", "Trap (EDM)", 1)


def build_up_track_information(genre_sheet: Spreadsheet, subgenre_sheet: Spreadsheet, start: date, end: date) -> List[Track]:
	if GENRE_SHEET_CATALOG_SHEET_NAME is None:
		raise ValueError("the GENRE_SHEET_CATALOG_SHEET_NAME environment variable needs a value, like Main")
	genre_sheet_catalog = genre_sheet.worksheet(GENRE_SHEET_CATALOG_SHEET_NAME)

	subgenre_sheet_tabs = subgenre_sheet.worksheets()

	# The naming scheme of tabs on the Subgenre Sheet is 2020-2024, 2015-2019, ..., Pre-2010s
	relevant_tabs: List[Worksheet] = []
	for tab in subgenre_sheet_tabs:
		years = parse("{min}-{max}", tab.title)
		if years is None:
			continue
		
		if years["min"] == "Pre":
			# Since the tab is called Pre-2010s, we have to fix that by chopping off the last character
			# We are also treating year 0 as the earliest someone would ever make music
			year_range = range(0, int(years["max"][:-1]))
		else:
			year_range = range(int(years["min"]), int(years["max"]) + 1)

		# For instance, 2013-2020 needs 2010-2014, 2015-2019, and 2020-2024
		if any(year in year_range for year in range(end.year, start.year + 1)):
			relevant_tabs.append(tab)

	print(f"about to start hunting tracks from {start} to {end} down (this could take a while)")
	# 1 for skipping the header row, + 1 for arrays starting at 0 = 2
	genre_sheet_tracks = [genre_sheet_record_to_track(record=record, row=row + 2, source_tab=GENRE_SHEET_CATALOG_SHEET_NAME) for row, record in enumerate(genre_sheet_catalog.get_all_records())]
	subgenre_sheet_tracks = [[subgenre_sheet_record_to_track(record=record, row=row + 2, source_tab=subgenre_sheet_tab.title) for row, record in enumerate(subgenre_sheet_tab.get_all_records())] for subgenre_sheet_tab in relevant_tabs]
	
	chunks_of_rows = []
	for track_catalog in [genre_sheet_tracks, *subgenre_sheet_tracks]:
		track_list = list(track_catalog)
		searchable_track_list = LazyBisectable(track_list, reversed=True, key=lambda track: datetime.strptime(track["release_date"], "%Y-%m-%d").date())
		# Double reverse
		newest_index_inclusive = len(track_list) - bisect_right(searchable_track_list, start)
		oldest_index_exclusive = len(track_list) - bisect_left(searchable_track_list, end)
		oldest_index_inclusive = oldest_index_exclusive - 1

		print(f"--- {track_list[newest_index_inclusive]['source_name']}: {track_list[newest_index_inclusive]['source_tab']} ---")
		print(f"{track_list[newest_index_inclusive]['title']} ({track_list[newest_index_inclusive]['release_date']}) — {track_list[oldest_index_inclusive]['title']} ({track_list[oldest_index_inclusive]['release_date']})")
		print()

		chunks_of_rows.append(track_list[newest_index_inclusive:oldest_index_exclusive])

	return list(chain(*chunks_of_rows))


def seed_firestore_with_track_data(firestore: FirestoreClient, tracks: List[Track]) -> None:
	tracks_collection_ref = firestore.collection("tracks")
	warnings: List[str] = []

	list_tracks = list(tracks)
	# Sort and group by release date
	by_release = itemgetter("release_date")
	list_tracks.sort(key=by_release, reverse=True)
	for release_date_string, tracks_released_on_this_date in groupby(tracks, key=by_release):
		try:
			release_date = datetime.strptime(release_date_string, "%Y-%m-%d")
		except ValueError:
			warning_message = f"{release_date_string} is being skipped because it doesn't have a valid release date, but it has these tracks: {list(tracks_released_on_this_date)}"
			warn(warning_message)
			warnings.append(warning_message)

		by_label = itemgetter("record_label")
		
		tracks_released_on_this_date_sorted_by_label = list(
			tracks_released_on_this_date)
		tracks_released_on_this_date_sorted_by_label.sort(key=by_label)
		for record_label, row_tracks in groupby(tracks_released_on_this_date_sorted_by_label, key=by_label):
			track: Track
			for i, track in enumerate(row_tracks):
				artist = str(track["artist"])
				title = str(track["title"])

				track_id = id_for_track(artist=artist, title=title, release_date=release_date_string)

				subgenres_nested = parse_genre(track["subgenre"])
				subgenres_flat = flatten_subgenres(subgenres_nested)

				subgenres, operators = unordered_subgenres_and_operators(subgenres_flat)

				document = {
					"artist": artist,
					"title": title,
					"releaseDate": release_date,

					"recordLabel": record_label,
					"indexOnLabelOnRelease": i,

					# Has to be represented as a string since Firebase doesn't support nested arrays :(
					"subgenresNested": dumps(subgenres_nested),

					"unorderedSubgenres": sorted(subgenres),
					"unorderedOperators": sorted(operators),

					"length": track["length"],
					"bpm": track["bpm"],
					"key": track["key"],

					# Whether this information came from the Subgenre Sheet or Genre Sheet
					"sourceKey": track["source_key"],
					"sourceName": track["source_name"],
					# And where on it
					"sourceTab": track["source_tab"],
					"sourceRow": track["source_row"],
				}

				print(f"{track['source_name']}'s row {track['source_row']} ({track_id}):")
				print(document)
				# breakpoint()

				document_ref = tracks_collection_ref.document(track_id)
				document_ref.set(document)
				print()

	print()
	print()
	print("🧬 the cloning process for tracks is done!")
	if warnings:
		print("⚠️ it finished with these warnings: ")
		for warning in warnings:
			print(warning)


if __name__ == "__main__":
	from sys import argv

	# 2020-06-28:2020-06-10 -> 2020-06-28, 2020-06-10
	start_string, _, end_string = argv[-1].partition(":")

	# Do a single date (by specifying it as the start and end) 
	# i.e. 2020-06-28 -> 2020-06-28, 2020-06-28
	if end_string == "":
		end_string = start_string

	start, end = [datetime.strptime(thing, "%Y-%m-%d").date() for thing in [start_string, end_string]]
	
	firestore = get_firestore()
	genre_sheet = get_genre_sheet()
	subgenre_sheet = get_subgenre_sheet()

	tracks = build_up_track_information(genre_sheet, subgenre_sheet, start, end)
	seed_firestore_with_track_data(firestore, tracks)

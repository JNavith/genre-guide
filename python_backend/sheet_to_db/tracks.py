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

from collections import defaultdict, namedtuple
from datetime import datetime
from json import dumps
from os import getenv
from typing import Awaitable, DefaultDict, Dict, Iterable, Iterator, List, Set, Tuple, cast
from warnings import warn

from gspread import Spreadsheet, Worksheet

from ..genre_utils import parse_genre
from ..track_utils import id_for_track
from . import FirestoreClient, get_firestore, get_google_sheet

def build_up_track_information(genre_sheet: Spreadsheet, row_start: int, row_end: int) -> "Iterator[Track]":
	catalog: Worksheet = genre_sheet.worksheet(getenv("CATALOG_SHEET_NAME"))

	fields: List[str] = [field.casefold() for field in catalog.row_values(1)]
	Track = namedtuple("Track", fields)

	for entry in catalog.get_all_values()[row_start+1:row_end]:
		track = Track._make(entry)

		if track.genre == "Trap":
			track = track._replace(genre="Trap (EDM)")

		# If the first subgenre in the list is unknown,
		if track.subgenre.startswith("?"):
			# And there is a genre specified,
			if track.genre != "?":
				# Replace the bare ? with ? (Genre)
				track = track._replace(subgenre=cast(
					str, track.subgenre).replace("?", f"? ({track.genre})", 1))
		# Ambiguity for Trap as well
		# todo: make this happen on any subgenre in the tree
		elif track.subgenre.startswith("Trap"):
			if track.genre == "Hip Hop":
				track = track._replace(subgenre=cast(
					str, track.subgenre).replace("Trap", "Trap (Hip Hop)", 1))
			elif track.genre in {"Trap", "Trap (EDM)"}:
				track = track._replace(subgenre=cast(
					str, track.subgenre).replace("Trap", "Trap (EDM)", 1))

		# Replace the textual subgenre with the parsed one
		track = track._replace(subgenre=parse_genre(track.subgenre))

		yield track


def seed_firestore_with_track_data(firestore: FirestoreClient, tracks: "Iterable[Tracks]") -> None:
	tracks_collection_ref = firestore.collection("tracks")
	for i, track in enumerate(tracks):
		artist = track.artist
		title = track.track
		release = track.release

		id_ = id_for_track(artist=artist, title=title, release_date=release)

		try:
			release_date = datetime.strptime(track.release, "%Y-%m-%d")
		except ValueError:
			warn(f"{artist} - {title} is being skipped because it doesn't have a valid release date: {release}")

		document = {
			"artist": artist,
			"title": title,
			# TODO: album
			"releaseDate": release_date,
			"recordLabel": track.label,
			# Has to be represented as a string :(
			"subgenresNested": dumps(track.subgenre),
		}

		print(i, id_, document)
		# breakpoint()

		document_ref = tracks_collection_ref.document(id_)
		document_ref.set(document)


if __name__ == "__main__":
	from sys import argv
	low, _, high = argv[-1].partition(":")
	firestore = get_firestore()
	google_sheet = get_google_sheet()
	tracks = build_up_track_information(google_sheet, int(low), int(high))
	seed_firestore_with_track_data(firestore, tracks)

from collections import Iterator, defaultdict, namedtuple
from json import dumps
from os import getenv
from typing import Awaitable, DefaultDict, Dict, Iterable, List, Set, Tuple, cast

from aioredis.commands import MultiExec, Redis
from gspread import Spreadsheet, Worksheet

# noinspection PyUnresolvedReferences
from .genre_utils import parse_genre
# noinspection PyUnresolvedReferences
from .track_utils import id_for_track


# noinspection PyUnresolvedReferences
def get_all_tracks(genre_sheet: Spreadsheet) -> "Iterator[Track]":
	catalog: Worksheet = genre_sheet.worksheet(getenv("CATALOG_SHEET_NAME"))
	
	fields: List[str] = [field.casefold() for field in catalog.row_values(1)]
	Track = namedtuple("Track", fields)
	
	for entry in catalog.get_all_values():
		track = Track._make(entry)
		
		if track.genre == "Trap":
			track = track._replace(genre="Trap (EDM)")
		
		# If the first subgenre in the list is unknown,
		if track.subgenre.startswith("?"):
			# And there is a genre specified,
			if track.genre != "?":
				# Replace the bare ? with ? (Genre)
				track = track._replace(subgenre=cast(str, track.subgenre).replace("?", f"? ({track.genre})", 1))
		# Ambiguity for Trap as well
		elif track.subgenre.startswith("Trap"):
			if track.genre == "Hip Hop":
				track = track._replace(subgenre=cast(str, track.subgenre).replace("Trap", "Trap (Hip Hop)", 1))
			elif track.genre == "Trap":
				track = track._replace(subgenre=cast(str, track.subgenre).replace("Trap", "Trap (EDM)", 1))
		
		# Replace the textual subgenre with the parsed one
		track = track._replace(subgenre=dumps(parse_genre(track.subgenre)))
		
		yield track


# noinspection PyUnresolvedReferences
def create_tracks_data_set(tracks: "Iterable[Track]") -> Dict[str, List[tuple]]:
	"""Create a mapping (basically just a list with some names) in preparation for Redis actions"""
	
	actions: DefaultDict[str, List[Tuple]] = defaultdict(list)
	
	for num, track in enumerate(tracks, start=1):
		track_id = id_for_track(track.artist, track.track, track.release)
		
		# Add the track to the set of all tracks
		actions["track_hash_in_set"].append(("tracks", f"{track_id}"))
		
		# Add the track by its hash (ID) to the database (as an independent key)
		actions["track_by_hash_as_key"].append((f"track:{track_id}", track._asdict()))
		
		# Add the track to the date set
		actions["dates_tracks"].append((f"date:{track.release}", f"{track_id}"))
		
		# Add the date to the dates set
		actions["dates_set"].append(("dates", f"{track.release}"))
	
	return actions


async def seed_redis_with_track_data(redis: Redis, tracks_data_set: Dict[str, List[Tuple]]) -> List[Awaitable]:
	awaitables: List[Awaitable] = []
	
	# Group by 100 operations
	actions_per_transaction: int = 100
	# Initial transaction object (will be overwritten every `actions_per_transaction` loops)
	transaction: MultiExec = redis.multi_exec()
	
	# DEBUG
	await redis.flushall()
	# END DEBUG
	
	tracks_already_in_database: Set[str] = set(await redis.smembers("tracks"))
	tracks_being_added: Set[str] = set()
	
	index: int = -1
	
	for index, (track_set_name, track_id) in enumerate(tracks_data_set["track_hash_in_set"], start=index + 1):
		# Compared against `actions_per_transaction-1` so that the first transaction isn't empty
		# (there must be a better way)
		if (index % actions_per_transaction) == (actions_per_transaction - 1):
			awaitables.append(transaction.execute())
			# Create a new transaction
			transaction: MultiExec = redis.multi_exec()
		
		tracks_being_added.add(track_id)
		transaction.hmset_dict(track_set_name, track_id)
	
	for index, (track_id, dictionary) in enumerate(tracks_data_set["track_by_hash_as_key"], start=index + 1):
		# Compared against `actions_per_transaction-1` so that the first transaction isn't empty
		# (there must be a better way)
		if (index % actions_per_transaction) == (actions_per_transaction - 1):
			awaitables.append(transaction.execute())
			# Create a new transaction
			transaction: MultiExec = redis.multi_exec()
		
		transaction.hmset_dict(track_id, dictionary)
	
	# Continue where the last one left off (in terms of grouping by transaction)
	for index, (date, track_id) in enumerate(tracks_data_set["dates_tracks"], start=index + 1):
		if (index % actions_per_transaction) == (actions_per_transaction - 1):
			awaitables.append(transaction.execute())
			transaction: MultiExec = redis.multi_exec()
		
		# Only add the track to the tracks by a certain date list if the track isn't already in the database
		if track_id not in tracks_already_in_database:
			transaction.rpush(date, track_id)
	
	for index, (date_set_name, date) in enumerate(tracks_data_set["dates_set"], start=index + 1):
		if (index % actions_per_transaction) == (actions_per_transaction - 1):
			awaitables.append(transaction.execute())
			transaction: MultiExec = redis.multi_exec()
		
		transaction.sadd(date_set_name, date)
	
	# Remove songs that were removed from the sheet
	for index, track_id in enumerate(tracks_already_in_database - tracks_being_added, start=index + 1):
		if (index % actions_per_transaction) == (actions_per_transaction - 1):
			awaitables.append(transaction.execute())
			transaction: MultiExec = redis.multi_exec()
		
		transaction.srem("tracks", f"{track_id}")
		transaction.unlink(f"track:{track_id}")
	
	# Add leftovers (that didn't make it into a group)
	awaitables.append(transaction.execute())
	
	return awaitables

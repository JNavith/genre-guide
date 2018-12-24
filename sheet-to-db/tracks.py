from collections import Iterator, defaultdict, namedtuple
from hashlib import blake2b
from os import getenv
from typing import Awaitable, DefaultDict, Dict, List, Tuple

from aioredis.commands import MultiExec, Redis
from gspread import Spreadsheet, Worksheet


def get_all_tracks(genre_sheet: Spreadsheet) -> "Iterator[Track]":
	catalog: Worksheet = genre_sheet.worksheet(getenv("CATALOG_SHEET_NAME"))
	
	fields: List[str] = [field.casefold() for field in catalog.row_values(1)]
	Track = namedtuple("Track", fields)
	
	return map(Track._make, catalog.get_all_values())


def create_tracks_data_set(tracks: "Iterable[Track]") -> Dict[str, List[tuple]]:
	"Create a mapping (basically just a list with some names) in preparation for Redis actions"
	
	actions: DefaultDict[str, List[Tuple]] = defaultdict(list)
	
	# noinspection PyUnresolvedReferences
	for num, track in enumerate(tracks, start=1):
		# Probably the best traits to form a unique ID from
		song_id: str = "\n".join([track.artist, track.track, track.release])
		hashed: str = blake2b(song_id.encode("utf8")).hexdigest()
		
		# Add the track by its hash (ID) to the database
		actions["track_by_hash"].append((f"track:{hashed}", track._asdict()))
		
		# Add the track to the date set
		actions["dates_tracks"].append((f"date:{track.release}", f"track:{hashed}"))
	
	return actions


async def seed_redis_with_track_data(redis: Redis, tracks_data_set: Dict[str, List[Tuple]]) -> List[Awaitable]:
	awaitables: List[Awaitable] = []
	
	# Group by 100 operations
	actions_per_transaction: int = 100
	# Initial transaction object (will be overwritten every `actions_per_transaction` loops)
	transaction: MultiExec = redis.multi_exec()
	
	for index, (track_id, dictionary) in enumerate(tracks_data_set["track_by_hash"]):
		# Compared against `actions_per_transaction-1` so that the first transaction isn't empty
		# (there must be a better way)
		if (index % actions_per_transaction) == (actions_per_transaction - 1):
			awaitables.append(transaction.execute())
			# Create a new transaction
			transaction: MultiExec = redis.multi_exec()
		
		transaction.hmset_dict(track_id, dictionary)
	
	# Continue where the last one left off (in terms of grouping by transaction)
	for index, (date, track_id) in enumerate(tracks_data_set["dates_tracks"], start=index + 1):
		# Compared against `actions_per_transaction-1` so that the first transaction isn't empty
		# (there must be a better way)
		if (index % actions_per_transaction) == (actions_per_transaction - 1):
			awaitables.append(transaction.execute())
			# Create a new transaction
			transaction: MultiExec = redis.multi_exec()
		
		transaction.sadd(date, track_id)
	
	# Add leftovers (that didn't make it into a group)
	awaitables.append(transaction.execute())
	
	return awaitables

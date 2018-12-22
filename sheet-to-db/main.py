#    genre.guide - From Google Sheets to Redis main Python file
#    Copyright (C) 2018 Navith
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

from asyncio import AbstractEventLoop, Future, as_completed, gather, get_event_loop, sleep
from collections import defaultdict, namedtuple
from hashlib import blake2b
from itertools import islice
from os import getenv
from typing import Awaitable, Dict, Iterator, List, Set, Tuple, Type

from aioredis import Redis, create_redis_pool
from gspread import Client, Spreadsheet, Worksheet, authorize
from gspread.exceptions import APIError
from gspread.utils import rowcol_to_a1
from gspread_formatting import get_effective_format
from oauth2client.service_account import ServiceAccountCredentials


def open_genre_sheet() -> Spreadsheet:
	scope: List[str] = ["https://www.googleapis.com/auth/drive.readonly"]
	credentials: ServiceAccountCredentials = ServiceAccountCredentials.from_json_keyfile_name("client.secret.json", scope)
	client: Client = authorize(credentials)
	
	return client.open_by_key(getenv("SHEET_KEY"))


def get_all_tracks_with_header(genre_sheet: Spreadsheet) -> List[List[str]]:
	catalog: Worksheet = genre_sheet.worksheet(getenv("CATALOG_SHEET_NAME"))
	return catalog.get_all_values()


async def build_up_genre_information(genre_sheet: Spreadsheet):
	genres_tab: Worksheet = genre_sheet.worksheet(getenv("GENRES_SHEET_NAME"))
	
	entries: Iterator[List[str]] = iter(genres_tab.get_all_values())
	
	header: List[str] = [label.lower() for label in next(entries)]
	
	# Used to track the parents in the moment (very frequently overwritten)
	# It's a mapping of the column number to the row number and subgenre / genre
	hierarchy: Dict[int, Tuple[int, str]] = {}
	
	# The set of the parents to the subgenre or genre in question
	# A simplistic example is "Hard Trap": {"Rawstyle", "Hybrid Trap"}
	# Or "Future Bass": {"Trap (EDM)", "Wonky", "Electronic Dance Music", "Purple Sound"}
	origins: Dict[str, Set[str]] = defaultdict(set)
	
	row_num: int
	row: List[str]
	col_num: int
	subgenre: str
	for row_num, row in enumerate(entries, start=2):
		for col_num, subgenre in enumerate(row, start=1):
			if subgenre:
				# We found a genre (as opposed to a subgenre)
				if col_num == 1:
					while True:
						try:
							# Be confident that all genres are bold
							assert get_effective_format(genres_tab, rowcol_to_a1(row_num, col_num)).textFormat.bold
						except (ValueError, APIError) as e:
							# Probably a quota limit
							print(e, flush=True)
							await sleep(4)
						else:
							break
				
				hierarchy[col_num]: Tuple[int, str] = (row_num, subgenre)
				
				this_subgenres_origins: Set[str] = origins[subgenre]
				
				if col_num > 1:
					while True:
						try:
							# Todo: use this function's source code as a guide to get all format data in advance
							# and prevent quota limit errors
							text_format = get_effective_format(genres_tab, rowcol_to_a1(hierarchy[col_num - 1][0], col_num - 1)).textFormat
						except APIError as e:
							# Probably a quota limit
							print(e, flush=True)
							await sleep(4)
						# debug: for some reason there's an error about format component "right"
						# that occurs persistently at complextro / moombahcore (not sure which one yet)
						except ValueError:
							breakpoint()
						else:
							# Be confident that there are no subgenres of strikethroughed or italicized subgenres / genres
							assert (not text_format.italic and not text_format.strikethrough)
							break
					
					# Add the parent to this subgenre's origins
					this_subgenres_origins.add(hierarchy[col_num - 1][1])
				
				# Move onto the next row
				break
		
		print(origins, flush=True)
		print(hierarchy, flush=True)


async def seed_redis(tracks_with_header: List[List[str]]) -> List[Future]:
	redis: Redis = await create_redis_pool("redis://redis", password=getenv("REDIS_PASSWORD"))
	
	fields: List[str] = [field.casefold() for field in tracks_with_header[0]]
	Track: Type[tuple] = namedtuple("Track", fields)
	
	# Skip the header row
	all_tracks = islice(tracks_with_header, 1, None)
	
	futures: List[Future] = []
	
	# noinspection PyUnresolvedReferences
	for num, track in enumerate(map(Track._make, all_tracks), start=1):
		# Probably the best traits to form a unique ID from
		song_id: str = "\n".join([track.artist, track.track, track.release])
		hashed: str = blake2b(song_id.encode("utf8")).hexdigest()
		
		awaitables: List[Awaitable] = [
			# Add the track by its hash (ID) to the database
			redis.hmset_dict(f"track:{hashed}", track._asdict()),
			
			# Add the track to the date set
			redis.sadd(f"date:{track.release}", f"track:{hashed}"),
		]
		
		# Gather the awaitables and create a task to run them
		futures.append(gather(*awaitables))
	
	return futures


async def main(loop: AbstractEventLoop):
	print("preparing to seed the redis database", flush=True)
	# futures: List[Future] = await seed_redis(get_all_tracks_with_header())
	
	# dev
	await build_up_genre_information(open_genre_sheet())
	return
	# end dev
	
	print(f"going to wait for {len(futures)} futures to finish before exiting", flush=True)
	# Wait for all tasks to finish before exiting
	for future in as_completed(futures, loop=loop):
		await future


if __name__ == "__main__":
	loop = get_event_loop()
	loop.run_until_complete(main(loop))

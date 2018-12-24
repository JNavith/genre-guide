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
from asyncio import AbstractEventLoop, as_completed, get_event_loop
from contextlib import closing
from itertools import chain
from os import getenv
from typing import Awaitable, List

from aioredis import Redis, create_redis_pool, ReplyError
from gspread import Client, Spreadsheet, authorize
from oauth2client.service_account import ServiceAccountCredentials

from .genres import build_up_subgenre_information, create_subgenres_data_set, seed_redis_with_subgenre_data
from .tracks import create_tracks_data_set, get_all_tracks, seed_redis_with_track_data


def open_genre_sheet() -> Spreadsheet:
	scope: List[str] = ["https://www.googleapis.com/auth/drive.readonly"]
	credentials: ServiceAccountCredentials = ServiceAccountCredentials.from_json_keyfile_name("./app/client.secret.json", scope)
	client: Client = authorize(credentials)
	
	return client.open_by_key(getenv("SHEET_KEY"))


async def main(loop: AbstractEventLoop):
	redis: Redis
	with closing(await create_redis_pool("redis://redis", password=getenv("REDIS_PASSWORD"))) as redis:
		genre_sheet: Spreadsheet = open_genre_sheet()
		
		print("preparing to seed the Redis database", flush=True)
		futures: List[List[Awaitable]] = []
		
		futures.append(await seed_redis_with_track_data(redis, create_tracks_data_set(get_all_tracks(genre_sheet))))
		
		futures.append(await seed_redis_with_subgenre_data(redis, create_subgenres_data_set(build_up_subgenre_information(genre_sheet))))
		
		print(f"going to wait for {sum(map(len, futures))} futures to finish before exiting", flush=True)
		# Wait for all tasks to finish before exiting
		for future in as_completed(chain.from_iterable(futures), loop=loop):
			await future
	
	print("done, creating a backup")
	try:
		await redis.bgsave()
	except ReplyError as e:
		await redis.bgsave()
	
	print("done, waiting to close the Redis connection...", flush=True)
	await redis.wait_closed()
	
	print("exiting", flush=True)


if __name__ == "__main__":
	loop = get_event_loop()
	loop.run_until_complete(main(loop))

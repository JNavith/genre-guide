#    genre.guide - From Google Sheets to Redis main Python file
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


from asyncio import as_completed, run, wait_for
from contextlib import closing
from itertools import chain
from os import getenv
from pathlib import Path
from ssl import _create_unverified_context
from typing import Awaitable, Coroutine, List

from aioredis import Redis, ReplyError, create_redis_pool
from gspread import Client, Spreadsheet, authorize
from oauth2client.service_account import ServiceAccountCredentials

from .genres import build_up_subgenre_information, create_subgenres_data_set, seed_redis_with_subgenre_data
from .tracks import create_tracks_data_set, get_all_tracks, seed_redis_with_track_data


def open_genre_sheet() -> Spreadsheet:
    scope: List[str] = ["https://www.googleapis.com/auth/drive.readonly"]
    keyfile = Path(__file__).parent.parent.parent / "config" / "client_secret.json"
    credentials: ServiceAccountCredentials = ServiceAccountCredentials.from_json_keyfile_name(
        str(keyfile), scope)
    client: Client = authorize(credentials)

    return client.open_by_key(getenv("SHEET_KEY"))


async def main():
    redis_host: str = f"redis://{getenv('REDIS_HOST', 'redis')}"
    redis_password: str = getenv("REDIS_PASSWORD")
    ssl: bool = getenv("REDIS_SSL", "False") == "True"

    redis_pool: Coroutine[Redis] = create_redis_pool(
        redis_host,
        password=redis_password,
        # This is so sad
        ssl=_create_unverified_context() if ssl else False)

    print("about to connect to redis", flush=True)
    with closing(await wait_for(redis_pool, timeout=30)) as redis:
        print("connected to redis", flush=True)

        print("destroying the Redis database before refilling it", flush=True)
        await redis.flushall()
        print("destroyed the Redis database", flush=True)

        print("about to open the Genre Sheet", flush=True)
        genre_sheet: Spreadsheet = open_genre_sheet()
        print("opened the Genre Sheet", flush=True)

        print("preparing to seed the Redis database", flush=True)
        futures: List[List[Awaitable]] = [
            await seed_redis_with_track_data(redis, create_tracks_data_set(get_all_tracks(genre_sheet))),
            await seed_redis_with_subgenre_data(redis, create_subgenres_data_set(*build_up_subgenre_information(genre_sheet))),
        ]

        print(f"going to wait for {sum(map(len, futures))} futures to finish before exiting", flush=True)
        # Wait for all tasks to finish before exiting
        for future in as_completed(chain.from_iterable(futures)):
            await future

        print("done, creating a backup")
        try:
            await redis.bgsave()
        except ReplyError as e:
            # It'll say something about not being able to save right now because of an AOF re-write.
            # Whatever.
            print(e)

    print("done, waiting to close the Redis connection...", flush=True)
    await redis.wait_closed()

    print("exiting", flush=True)


if __name__ == "__main__":
    run(main())

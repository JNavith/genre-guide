#    genre.guide - GraphQL server main Python file
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

from contextlib import closing
from datetime import date, datetime, timedelta
from functools import lru_cache
from itertools import count
from json import dumps, loads
from os import getenv
from re import sub
from typing import Generator, List as typing_List, Optional, Tuple, cast

from aioredis import Redis, create_redis_pool
from graphene import Argument, Boolean, Date, Enum, Field, ID, Int, List, ObjectType, Schema, String
from graphql import GraphQLError, GraphQLObjectType
from graphql.execution.executors.asyncio import AsyncioExecutor
from starlette.applications import Starlette
from starlette.graphql import GraphQLApp
from starlette.middleware.cors import CORSMiddleware
from uvicorn import run
from uvicorn.loops.uvloop import uvloop_setup

# noinspection PyUnresolvedReferences
from .genre_utils import flatten_subgenres

app = Starlette()
loop = uvloop_setup()


class ColorRepresentation(Enum):
	"""A format that a color can come in, such as HEX"""
	
	HEX = 0
	TAILWIND = 1
	
	@property
	def description(self):
		if self == ColorRepresentation.HEX:
			return 'The color as a hex code in a string, such as "#ec00db"'
		elif self == ColorRepresentation.TAILWIND:
			return 'The color as a TailwindCSS color name (as found in a class name), such as "genre-ambient"'


class Color(ObjectType):
	"""A color for genres and subgenres. Includes information about the name (which genre it's tied to) and a hex representation."""
	
	from_genre = Field(String, description="The name of the genre that this color comes from")
	foreground = Field(String, representation=ColorRepresentation(name="representation", description="The format for the color, such as HEX"), description="The text color that appears on top of this color on the Genre Sheet")
	background = Field(String, representation=ColorRepresentation(name="representation", description="The format for the color, such as HEX"), description="The background color for the genre on the Genre Sheet")
	
	@staticmethod
	@lru_cache(maxsize=64)
	def _create_tailwind_class_name_for_genre(genre_name: str) -> str:
		words: typing_List[str] = (cast(str, genre_name)).lower().split()
		words_alpha_only: typing_List[str] = ["".join([letter for letter in word if letter.isalpha()]) for word in words]
		words_hyphenated: str = '-'.join(words_alpha_only)
		reduced_hyphens: str = sub(r"-+", "-", words_hyphenated)
		return f"genre-{reduced_hyphens}"
	
	@staticmethod
	async def _get_hex_colors(genre_name: str) -> Optional[typing_List[str]]:
		"""Returns None for subgenres, and a list of hex codes like ["#ec00db", "#ffffff"] for genres"""
		return loads((await do_redis("hget", Subgenre._get_redis_key(genre_name), "color")).decode("utf8"))
	
	async def resolve_foreground(self, info, representation: ColorRepresentation = ColorRepresentation.HEX):
		if representation == ColorRepresentation.HEX:
			return (await Color._get_hex_colors(cast(str, self.from_genre)))[1]
		elif representation == ColorRepresentation.TAILWIND:
			foreground = (await Color._get_hex_colors(cast(str, self.from_genre)))[1].lower()
			
			# These are the only colors we use, so why bother with anything else?
			if foreground == "#ffffff":
				return "white"
			elif foreground == "#000000":
				return "black"
			
			raise GraphQLError(f"internal error: the foreground color represented by hex {foreground} is neither white nor black")
		
		raise GraphQLError(f"unknown representation {representation!r} for foreground color")
	
	async def resolve_background(self, info, representation: ColorRepresentation = ColorRepresentation.HEX):
		if representation == ColorRepresentation.HEX:
			return (await Color._get_hex_colors(cast(str, self.from_genre)))[0]
		elif representation == ColorRepresentation.TAILWIND:
			return Color._create_tailwind_class_name_for_genre(cast(str, self.from_genre))
		
		raise GraphQLError(f"unknown representation {representation!r} for background color")


class Subgenre(ObjectType):
	"""A subgenre, as understood on the Genre Sheet"""
	
	name = String(required=True, description='The primary name of the subgenre, e.x. "Brostep"')
	alternative_names = List(String, description='Alternative names for the subgenre, e.x. {"DnB"} for Drum & Bass')
	names = List(String, description="The primary name of the subgenre, followed by its alternative names")
	is_genre = Boolean(required=True, description='Whether the subgenre is actually a genre (has its own category and color), e.x. true for Rock, false for Future House')
	genre = Field(lambda: Subgenre, required=True, description="The category that this subgenre belongs to, and that it inherits its color from, e.x. Vaporwave for Vaportrap, Future Bass for Future Bass")
	color = Field(Color, description="Color information about this subgenre, including the text color it uses on the Genre Sheet and the background color")
	origins = List(lambda: Subgenre, required=True, description='The list of subgenres that this subgenre comes directly from, e.x. {Detroit Techno,} for Big Room Techno, {UK Hip Hop, 2-Step Garage} for Grime')
	subgenres = List(lambda: Subgenre, required=True, description='The list of subgenres who originate directly from this subgenre, e.x. {Deathstep, Drumstep} for Dubstep, {} for Footwork, {Electro Swing, Jazzstep} for Nu-Jazz')
	
	@staticmethod
	@lru_cache(maxsize=1024)
	def _get_redis_key(subgenre_name: str) -> str:
		return f"subgenre:{subgenre_name}"
	
	@staticmethod
	@lru_cache(maxsize=1024)
	def _get_redis_key_for_alias(alias: str) -> str:
		return f"subgenre:alias:{alias}"
	
	@staticmethod
	@lru_cache(maxsize=64)
	def _clean_subgenre_name(subgenre_text: str) -> str:
		if subgenre_text.startswith("?"):
			# ? (Pop) -> Pop
			# Yes, I realize it's silly to reduce an unknown subgenre of a genre to that genre itself,
			# But call me when it really is a problem
			*_, genre_with_parenthesis = subgenre_text.partition("(")
			subgenre_text = genre_with_parenthesis[:-1]
		
		# Note that this leaves the "Experimental" subgenre alone because of the trailing space
		if subgenre_text.startswith("Experimental "):
			subgenre_text = subgenre_text.replace("Experimental ", "")
		
		return subgenre_text
	
	@property
	def _redis_key(self):
		return Subgenre._get_redis_key(cast(str, self.name))
	
	async def resolve_alternative_names(self, info):
		return loads(await do_redis("hget", self._redis_key, "alternative_names", encoding="utf8"))
	
	async def resolve_names(self, info):
		return [self.name, *(await self.resolve_alternative_names(info=info))]
	
	async def resolve_is_genre(self, info):
		result: Optional[str] = await do_redis("hget", self._redis_key, "is_genre")
		return loads(result)
	
	async def resolve_genre(self, info):
		return Subgenre(name=(await do_redis("hget", self._redis_key, "genre")).decode("utf8"))
	
	async def resolve_color(self, info):
		genre = await self.resolve_genre(info)
		return Color(from_genre=genre.name)
	
	async def resolve_origins(self, info):
		return [Subgenre(name=name) for name in loads(await do_redis("hget", self._redis_key, "origins"))]
	
	async def resolve_subgenres(self, info):
		return [Subgenre(name=name) for name in loads(await do_redis("hget", self._redis_key, "subgenres"))]


class ReleaseDate(ObjectType):
	datetime = Field(Date, name="datetime", description="(internal) datetime object used to determine the other fields")
	
	iso8601 = Field(Date, name="iso8601", description='The date as an ISO 8601 formatted string, like 2018-04-20')
	year = Field(Int, name="year", description="The year the track released")
	month_name = Field(String, name="month_name", description='The month the track released, as text ("December")')
	month_int = Field(Int, name="month_int", description='The month the track released, as an integer (12)')
	day = Field(Int, name="day", description="The day of the month the track released")
	
	def resolve_iso8601(self, info):
		return cast(datetime, self.datetime).strftime("%Y-%m-%d")
	
	def resolve_year(self, info):
		return cast(datetime, self.datetime).year
	
	def resolve_month_name(self, info):
		return cast(datetime, self.datetime).strftime("%B")
	
	def resolve_month_int(self, info):
		return cast(datetime, self.datetime).month
	
	def resolve_day(self, info):
		return cast(datetime, self.datetime).day


class Track(ObjectType):
	id = Field(ID, name="id", description="The unique ID describing this track")
	
	name = Field(String, name="name", description="The name of the track")
	
	artist = Field(String, name="artist", description="The artist(s) of the track")
	record_label = Field(String, name="record_label", description="The record label(s) who released and/or own the rights to the track")
	date = Field(ReleaseDate, description="The release date of the track")
	
	subgenres_json = String(name="subgenres_json", description="The parsed list of subgenres that make up this song as a JSON string (really low level and provisional)")
	subgenres_flat_json = String(name="subgenres_flat_json", and_colors=Argument(ColorRepresentation, required=False, description="Include a list of colors in sync with the list of subgenres with this specified representation (see ColorRepresentation for valid options)"),
	                             description="The subgenres that make up this song, as a flat list (contained in a JSON string). Note that this introduces ambiguity with subgenre grouping")
	
	image = String(name="image", description="The link to the cover artwork for the track, or a placeholder")
	
	@staticmethod
	def _get_redis_key(track_id: str) -> str:
		return f"track:{track_id}"
	
	@property
	def _redis_key(self):
		return Track._get_redis_key(cast(str, self.id))
	
	async def resolve_name(self, info):
		return (await do_redis("hget", self._redis_key, "track")).decode("utf8")
	
	async def resolve_artist(self, info):
		return (await do_redis("hget", self._redis_key, "artist")).decode("utf8")
	
	async def resolve_record_label(self, info):
		return (await do_redis("hget", self._redis_key, "label")).decode("utf8")
	
	async def resolve_date(self, info):
		underlying_datetime: datetime = datetime.strptime((await do_redis("hget", self._redis_key, "release")).decode("utf8"), "%Y-%m-%d")
		return ReleaseDate(datetime=underlying_datetime)
	
	async def resolve_subgenres_json(self, info):
		return (await do_redis("hget", self._redis_key, "subgenre")).decode("utf8")
	
	async def resolve_subgenres_flat_json(self, info, and_colors: Optional[ColorRepresentation] = None):
		flat_list: typing_List[str] = flatten_subgenres(loads(await self.resolve_subgenres_json(info)))
		
		if and_colors is None:
			return dumps(flat_list)
		
		colors: typing_List[Optional[Tuple[str, str]]] = []
		for subgenre in map(Subgenre._clean_subgenre_name, flat_list):
			if subgenre in {"|", ">", "~"}:
				colors.append(None)
			elif await do_redis("sismember", "subgenres", subgenre):
				color_info = await Subgenre(name=subgenre).resolve_color(info)
				colors.append((await color_info.resolve_background(info, representation=and_colors), await color_info.resolve_foreground(info, representation=and_colors)))
			else:
				# The subgenre does not exist
				colors.append(("black", "white") if and_colors == ColorRepresentation.TAILWIND else ("#000000", "#ffffff"))
		
		return dumps([flat_list, colors])
	
	async def resolve_image(self, info):
		# Todo: querying an external API (but whose?) before giving a no-answer
		return None


def all_dates_between(start: date, end: date, reverse: bool = False) -> Generator[date, None, None]:
	range_ = range((end - start).days + 1)
	if reverse:
		range_ = reversed(range_)
	
	for i in range_:
		yield start + timedelta(days=i)


def all_dates_before(end: date) -> Generator[date, None, None]:
	for i in count(0):
		yield end - timedelta(days=i)


class Query(ObjectType):
	all_subgenres = List(Subgenre, description="Retrieve all subgenres from the database")
	subgenre = Field(Subgenre, name=String(description='The name of the subgenre to retrieve, e.x. "Vaporwave"'), description="Retrieve a particular subgenre from the database")
	
	all_genres = List(Subgenre, description="Retrieve all genres (subgenres with their own color and category) from the database")
	
	tracks = List(Track,
	              before=Date(description="The newest date of songs to retrieve (inclusive)", required=False),
	              after=Date(description="The oldest date of songs to retrieve (inclusive)", required=False),
	              newest_first=Boolean(description="Whether to sort the returned tracks from newest to oldest, or oldest to newest", required=False),
	              limit=Int(description="The maximum number of songs to return", required=False),
	              before_id=ID(description="The newest song to retrieve (exclusive) by its ID. Do not set any other parameter than `limit` when using this", required=False),
	              description="Retrieve a range of tracks from the Genre Sheet")
	
	track = Field(Track, id=ID(description="The ID of the track to retrieve"), description="Retrieve a particular track from the database")
	
	async def resolve_all_subgenres(self, info):
		return [Subgenre(name=subgenre.decode("utf8")) for subgenre in await do_redis("smembers", "subgenres")]
	
	async def resolve_subgenre(self, info, name):
		if not (await do_redis("sismember", "subgenres", name)):
			if name.startswith("?"):
				name = Subgenre._transform_unknown_subgenre(name)
			
			aliases_to: Optional[bytes] = await do_redis("get", Subgenre._get_redis_key_for_alias(name))
			if aliases_to is not None:
				name = aliases_to.decode("utf8")
			
			if not (await do_redis("sismember", "subgenres", name)):
				raise GraphQLError(f"{name} is not a valid subgenre!")
		
		return Subgenre(name=name)
	
	async def resolve_all_genres(self, info):
		return [Subgenre(name=genre.decode("utf8")) for genre in await do_redis("smembers", "genres")]
	
	async def resolve_tracks(self, info, after=None, before=None, limit: Optional[int] = None, newest_first: bool = True, before_id=None):
		if before is None:
			# Two days from now
			before = date.today() + timedelta(days=2)
		
		if limit is None:
			limit = 100
		
		limit: int = max(0, min(limit, 1000))
		
		tracks: typing_List[Track] = []
		
		if after is not None:
			for date_ in all_dates_between(after, before, reverse=newest_first):
				for track_id in await do_redis("lrange", f"date:{date_.strftime('%Y-%m-%d')}", 0, -1):
					tracks.append(Track(id=track_id.decode("utf8")))
					
					limit -= 1
					if limit == 0:
						return tracks
		else:
			if not newest_first:
				raise GraphQLError("`newest_first` must be true when `after` is not specified")
			
			if before_id is not None:
				# Validate that the track exists
				if not await do_redis("sismember", "tracks", before_id):
					raise GraphQLError(f"There is no track with id {before_id!r}!")
				
				track_release_date: str = (await do_redis("hget", Track._get_redis_key(before_id), "release")).decode("utf8")
				position_in_date_list: int
				
				for index, other_track_id in enumerate(await do_redis("lrange", f"date:{track_release_date}", 0, -1)):
					if other_track_id.decode("utf8") == before_id:
						position_in_date_list = index
						break
				
				# Found the track's position. Yield the songs after it.
				for track_id in await do_redis("lrange", f"date:{track_release_date}", position_in_date_list + 1, -1):
					tracks.append(Track(id=track_id.decode("utf8")))
					
					limit -= 1
					if limit == 0:
						return tracks
				
				# If we reach this point, allow the "tracks before" mode to take over what's left
				before = datetime.strptime(track_release_date, "%Y-%m-%d") - timedelta(days=1)
			
			for date_ in all_dates_before(before):
				for track_id in await do_redis("lrange", f"date:{date_.strftime('%Y-%m-%d')}", 0, -1):
					tracks.append(Track(id=track_id.decode("utf8")))
					
					limit -= 1
					if limit == 0:
						return tracks
		
		# If the limit is not reached (for any of the cases from above), just return the list like this
		return tracks
	
	async def resolve_track(self, info, id):
		if not await do_redis("sismember", "tracks", id):
			raise GraphQLError(f"There is no track with id {id!r}!")
		
		return Track(id=id)


async def do_redis(command_name: str, *args, **kwds):
	return await getattr(redis, command_name)(*args, **kwds)


app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
app.add_route('/graphql', GraphQLApp(schema=Schema(query=cast(GraphQLObjectType, Query), auto_camelcase=False), executor=AsyncioExecutor(loop=loop)))

if __name__ == '__main__':
	redis: Redis = loop.run_until_complete(create_redis_pool(getenv("REDIS_HOST", "redis://redis"), password=getenv("REDIS_PASSWORD"), ssl=(getenv("REDIS_SSL", "False") == "True")))
	with closing(redis):
		run(app, host='0.0.0.0', port=80, loop=loop)

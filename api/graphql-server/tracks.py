from datetime import datetime
from json import dumps, loads
from typing import List as typing_List, Optional, Tuple, cast
from urllib.parse import quote

from graphene import Argument, Date, Field, ID, Int, ObjectType, String

from .subgenres import ColorRepresentation, Subgenre
from ..genre_utils import flatten_subgenres


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
		from .__main__ import do_redis
		
		return (await do_redis("hget", self._redis_key, "track")).decode("utf8")
	
	async def resolve_artist(self, info):
		from .__main__ import do_redis
		
		return (await do_redis("hget", self._redis_key, "artist")).decode("utf8")
	
	async def resolve_record_label(self, info):
		from .__main__ import do_redis
		
		return (await do_redis("hget", self._redis_key, "label")).decode("utf8")
	
	async def resolve_date(self, info):
		from .__main__ import do_redis
		
		underlying_datetime: datetime = datetime.strptime((await do_redis("hget", self._redis_key, "release")).decode("utf8"), "%Y-%m-%d")
		return ReleaseDate(datetime=underlying_datetime)
	
	async def resolve_subgenres_json(self, info):
		from .__main__ import do_redis
		
		return (await do_redis("hget", self._redis_key, "subgenre")).decode("utf8")
	
	async def resolve_subgenres_flat_json(self, info, and_colors: Optional[ColorRepresentation] = None):
		from .__main__ import do_redis
		
		flat_list: typing_List[str] = flatten_subgenres(loads(await self.resolve_subgenres_json(info)))
		
		if and_colors is None:
			return dumps(flat_list)
		
		colors: typing_List[Optional[Tuple[str, str]]] = []
		for subgenre in flat_list:
			if subgenre in {"|", ">", "~"}:
				colors.append(None)
			else:
				if await do_redis("sismember", "subgenres", subgenre):
					color_info = await Subgenre(name=subgenre).resolve_color(info)
					colors.append((await color_info.resolve_background(info, representation=and_colors), await color_info.resolve_foreground(info, representation=and_colors)))
				else:
					if not subgenre.startswith("?"):
						# The subgenre does not exist
						colors.append(("black", "white") if and_colors == ColorRepresentation.TAILWIND else ("#000000", "#ffffff"))
					else:
						subgenre = Subgenre._transform_unknown_subgenre(subgenre)
						if await do_redis("sismember", "subgenres", subgenre):
							color_info = await Subgenre(name=subgenre).resolve_color(info)
							colors.append((await color_info.resolve_background(info, representation=and_colors), await color_info.resolve_foreground(info, representation=and_colors)))
						else:
							# The genre this is an unknown subgenre of does not exist
							colors.append(("black", "white") if and_colors == ColorRepresentation.TAILWIND else ("#000000", "#ffffff"))
		
		return dumps([flat_list, colors])
	
	async def resolve_image(self, info):
		flat_list: typing_List[str] = flatten_subgenres(loads(await self.resolve_subgenres_json(info)))
		
		# Todo: querying an external API (but whose?) before giving a placeholder
		
		return f"/img/song-missing-art.svg?name={quote(flat_list[0][0])}"

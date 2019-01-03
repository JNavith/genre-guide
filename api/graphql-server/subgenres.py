from functools import lru_cache
from json import loads
from re import sub
from typing import List as typing_List, Optional, cast

from graphene import Boolean, Enum, Field, List, ObjectType, String
from graphql import GraphQLError


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
	async def _get_hex_colors(genre_name: str) -> Optional[typing_List[str]]:
		"""Returns None for subgenres, and a list of hex codes like ["#ec00db", "#ffffff"] for genres"""
		from .__main__ import do_redis
		
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
	
	@staticmethod
	@lru_cache(maxsize=64)
	def _create_class_name_for_genre(genre_name: str) -> str:
		words: typing_List[str] = (cast(str, genre_name)).lower().split()
		words_alpha_only: typing_List[str] = ["".join([letter for letter in word if letter.isalpha()]) for word in words]
		words_hyphenated: str = '-'.join(words_alpha_only)
		reduced_hyphens: str = sub(r"-+", "-", words_hyphenated)
		return f"genre-{reduced_hyphens}"
	
	async def resolve_background(self, info, representation: ColorRepresentation = ColorRepresentation.HEX):
		if representation == ColorRepresentation.HEX:
			return (await Color._get_hex_colors(cast(str, self.from_genre)))[0]
		elif representation == ColorRepresentation.TAILWIND:
			return Color._create_class_name_for_genre(cast(str, self.from_genre))
		
		raise GraphQLError(f"unknown representation {representation!r} for background color")


class Subgenre(ObjectType):
	"""A subgenre, as understood on the Genre Sheet"""
	
	name = String(required=True, description='The name of the subgenre, e.x. "Brostep"')
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
	@lru_cache(maxsize=64)
	def _transform_unknown_subgenre(unknown_subgenre_text: str) -> str:
		# ? (Pop) -> Pop
		# Yes, I realize it's silly to reduce an unknown subgenre of a genre to that genre itself,
		# But call me when it really is a problem
		*_, genre_with_parenthesis = unknown_subgenre_text.partition("(")
		return genre_with_parenthesis[:-1]
	
	@property
	def _redis_key(self):
		return Subgenre._get_redis_key(cast(str, self.name))
	
	async def resolve_is_genre(self, info):
		from .__main__ import do_redis
		
		result: Optional[str] = await do_redis("hget", self._redis_key, "is_genre")
		return loads(result)
	
	async def resolve_genre(self, info):
		from .__main__ import do_redis
		
		return Subgenre(name=(await do_redis("hget", self._redis_key, "genre")).decode("utf8"))
	
	async def resolve_color(self, info):
		genre = await self.resolve_genre(info)
		return Color(from_genre=genre.name)
	
	async def resolve_origins(self, info):
		from .__main__ import do_redis
		
		return [Subgenre(name=name) for name in loads(await do_redis("hget", self._redis_key, "origins"))]
	
	async def resolve_subgenres(self, info):
		from .__main__ import do_redis
		
		return [Subgenre(name=name) for name in loads(await do_redis("hget", self._redis_key, "subgenres"))]

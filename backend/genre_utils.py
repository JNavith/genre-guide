#    genre.guide - Genre utilities
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


from collections import defaultdict
from re import compile
from typing import DefaultDict, Dict, Iterator, List, Set, Tuple, Union, cast

OPERATORS: Set[str] = {"|", ">", "~"}
DIVIDERS: Set[str] = {"||", ">>", "~~"}

def error_on_more_than_one_kind_of_divider(*, genre_text: str, divider_counts: Dict[str, int]):
	if sum(divider_counts.values()) <= 1:
		return
	
	for this_divider in divider_counts:
		if not any(dcount for divider, dcount in divider_counts.items() if divider != this_divider):
			return
	
	raise ValueError(f"too many dividers in {genre_text}")

def error_on_misplaced_operators_even(*, genre_text: str, joined_words: List[str]):
	for index in range(0, len(joined_words), 2):
		if joined_words[index] in DIVIDERS or joined_words[index] in OPERATORS:
			raise ValueError(f"misplaced operator in {genre_text}")

def error_on_misplaced_operators_odd(*, genre_text: str, joined_words: List[str]):
	for index in range(1, len(joined_words), 2):
		if not (joined_words[index] in DIVIDERS or joined_words[index] in OPERATORS):
			raise ValueError(f"misplaced operator in {genre_text} (this should not be possible in my mind)")

def make_genre_groups(*, joined_words):
	skip_indices: Set[int] = set()

	for index, word_or_symbol in enumerate(joined_words):
		if index in skip_indices:
			continue

		# Prevent out of index errors
		if index + 2 >= len(joined_words):
			yield word_or_symbol[0]
			yield joined_words[index + 1]
			break

		if joined_words[index + 1] in OPERATORS:
			yield (joined_words[index], joined_words[index + 1][0], joined_words[index + 2])
			skip_indices.add(index + 1)
			skip_indices.add(index + 2)
		elif joined_words[index + 1] in DIVIDERS:
			yield word_or_symbol
			yield joined_words[index + 1][0]

def parse_genre(genre_text: str) -> Tuple:
	words_or_symbols: List[str] = genre_text.split()

	operator_counts: Dict[str, int] = {
		operator: words_or_symbols.count(operator)
		for operator in OPERATORS
	}
	divider_counts: Dict[str, int] = {
		divider: words_or_symbols.count(divider)
		for divider in DIVIDERS
	}

	# If there are no operators or dividers, just return the text as the only element in a tuple, right away
	if sum(operator_counts.values()) == sum(divider_counts.values()) == 0:
		return genre_text,

	# If there is more than one kind of divider -- that's an error
	error_on_more_than_one_kind_of_divider(genre_text=genre_text, divider_counts=divider_counts)

	subgenre_index: int = 0
	words: DefaultDict[List] = defaultdict(list)
	for index, word in enumerate(words_or_symbols):
		if word in operator_counts or word in divider_counts:
			subgenre_index += 1
			words[subgenre_index] = word

			subgenre_index += 1
			continue

		words[subgenre_index].append(word)

	joined_words: List[str] = [
		" ".join(word) if isinstance(word, list) else word
		for word in words.values()
	]

	# Verify that there are only genre names at even indices
	error_on_misplaced_operators_even(genre_text=genre_text, joined_words=joined_words)
	# Verify that there are only dividers or operators at odd indices
	error_on_misplaced_operators_odd(genre_text=genre_text, joined_words=joined_words)

	# Verify that the last word or symbol in the list is not an operator or divider
	if joined_words[-1] in DIVIDERS | OPERATORS:
		raise ValueError(f"misplaced operator at the end of {genre_text}")

	
	# If there are no dividers,
	if sum(divider_counts.values()) == 0:
		# And there is only one kind of operator,
		for this_operator in operator_counts:
			if not any(operator_counts[operator]
					   for operator in operator_counts.keys()
					   if operator != this_operator):
				# Then return the result as it is
				return tuple(joined_words)
		
		# Or, there could be subgroups in here
		subgroups_pattern = compile(r"\((.+?)\)")
		subgroups_results = subgroups_pattern.findall(genre_text)
		if not subgroups_results:
			# There is an ambiguity error (because there are multiple operators and no subgroups)
			raise ValueError(f"ambiguous grouping of genres from {genre_text}")

		for subgroup in subgroups_results:
			parsed_grouping = parse_genre(subgroup)
			replace_start = next(index for index, word in enumerate(joined_words) if isinstance(word, str) and word.startswith("("))
			replace_end = next(index for index, word in enumerate(joined_words) if isinstance(word, str) and word.endswith(")"))

			joined_words[replace_start:replace_end + 1] = (parsed_grouping,)
		return tuple(joined_words)
		
	return tuple(make_genre_groups(joined_words=joined_words))


def flatten_subgenres_iter(subgenres: Tuple) -> Iterator[str]:
	for subgenre_or_group_or_symbol in subgenres:
		if not isinstance(subgenre_or_group_or_symbol, str):
			yield from flatten_subgenres(subgenre_or_group_or_symbol)
			continue

		yield subgenre_or_group_or_symbol


def flatten_subgenres(subgenres: Tuple) -> List[str]:
	return list(flatten_subgenres_iter(subgenres))


def non_empty_lines_no_whitespace(text: str) -> Iterator[str]:
	return map(str.strip, filter(bool, text.splitlines(keepends=False)))


def parse_alternative_names(note: str) -> Set[str]:
	names: Set[str] = set()

	line: str
	for (index, line) in enumerate(non_empty_lines_no_whitespace(note)):
		if line.lower() == "alternative names:":
			continue

		if line.lower().startswith("short for"):
			words = line.split()
			# Get the text after "Short for" because it's the name
			name = " ".join(words[2:])
			names.add(name)
			continue

		if index == 0:
			# Add extra terms to whitelist here
			if line.lower() in {"umbrella term", "variations:"}:
				continue

			raise ValueError(f"""the first line of {note!r} is neither "Alternative names:" nor "Short for {{name}}", so it is improperly formatted""")

		for indicator in [" (shortened", " (retronym", " (plural"]:
			if indicator in line.lower():
				name = line[:line.lower().index(indicator)]
				names.add(name)
				break
		else:
			# At this point, the text in the line is the subgenre name
			names.add(line)

	return names

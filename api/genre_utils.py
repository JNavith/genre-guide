from collections import defaultdict
from typing import DefaultDict, Dict, List, Set, Tuple, Union

OPERATORS: Set[str] = {"|", ">", "~"}
DIVIDERS: Set[str] = {"||", ">>", "~~"}


def parse_genre(genre_text: str) -> Tuple:
	words_or_symbols: List[str] = genre_text.split()
	
	operator_counts: Dict[str, int] = {operator: words_or_symbols.count(operator) for operator in OPERATORS}
	divider_counts: Dict[str, int] = {divider: words_or_symbols.count(divider) for divider in DIVIDERS}
	
	# If there are no operators or dividers, just return the text as the only element in a tuple, right away
	if sum(operator_counts.values()) == sum(divider_counts.values()) == 0:
		return genre_text,
	
	# If there is more than one kind of divider -- that's an error
	if sum(divider_counts.values()) > 1:
		for this_divider in divider_counts:
			if not any(dcount for divider, dcount in divider_counts.items() if divider != this_divider):
				break
		else:
			raise ValueError(f"too many dividers in {genre_text}")
	
	subgenre_index: int = 0
	words: DefaultDict[List] = defaultdict(list)
	for index, word in enumerate(words_or_symbols):
		if word in operator_counts or word in divider_counts:
			subgenre_index += 1
			words[subgenre_index] = word
			
			subgenre_index += 1
			continue
		
		words[subgenre_index].append(word)
	
	joined_words: List[str] = [" ".join(word) if isinstance(word, list) else word for word in words.values()]
	
	# Verify that there are only genre names at even indices
	for index in range(0, len(joined_words), 2):
		if joined_words[index] in DIVIDERS or joined_words[index] in OPERATORS:
			raise ValueError(f"misplaced operator in f{genre_text}")
	
	# Verify that there are only dividers or operators at odd indices
	for index in range(1, len(joined_words), 2):
		if not (joined_words[index] in DIVIDERS or joined_words[index] in OPERATORS):
			raise ValueError(f"misplaced operator in {genre_text} (this should not be possible in my mind)")
	
	# Verify that the last word or symbol in the list is not an operator or divider
	if joined_words[-1] in DIVIDERS | OPERATORS:
		raise ValueError(f"misplaced operator at the end of {genre_text}")
	
	# If there are no dividers,
	if sum(divider_counts.values()) == 0:
		# And there is only one kind of operator,
		for this_operator in operator_counts:
			if not any(operator_counts[operator] for operator in operator_counts.keys() if operator != this_operator):
				# Then return the result as it is
				return tuple(joined_words)
		
		# Otherwise, there is an ambiguity error (because there are multiple operators)
		raise ValueError(f"ambiguous grouping of genres from {genre_text}")
	
	groups: List[Union[str, Tuple[str, str, str]]] = []
	skip_indices: Set[int] = set()
	
	for index, word_or_symbol in enumerate(joined_words):
		if index in skip_indices:
			continue
		
		# Prevent out of index errors
		if index + 2 >= len(joined_words):
			groups.append(word_or_symbol[0])
			groups.append(joined_words[index + 1])
			break
		
		if joined_words[index + 1] in OPERATORS:
			groups.append((joined_words[index], joined_words[index + 1][0], joined_words[index + 2]))
			
			skip_indices.add(index + 1)
			skip_indices.add(index + 2)
		elif joined_words[index + 1] in DIVIDERS:
			groups.append(word_or_symbol)
			groups.append(joined_words[index + 1][0])
	
	return tuple(groups)


def flatten_subgenres(subgenres: Tuple) -> List[str]:
	flat_list: List[str] = []
	
	for subgenre_or_group_or_symbol in subgenres:
		if not isinstance(subgenre_or_group_or_symbol, str):
			flat_list.extend(flatten_subgenres(subgenre_or_group_or_symbol))
			continue
		
		flat_list.append(subgenre_or_group_or_symbol)
	
	return flat_list

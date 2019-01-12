# noinspection PyUnresolvedReferences
from .genre_utils import parse_alternative_names


def test_parse_alternative_names_single_simple():
	"""Simple cases with a single alternative name, and proper formatting"""
	
	assert parse_alternative_names("Alternative names:\nSpace Bass") == {"Space Bass"}
	assert parse_alternative_names("Alternative names:\nDancefloor Drum & Bass") == {"Dancefloor Drum & Bass"}
	assert parse_alternative_names("Alternative names:\nPhonk") == {"Phonk"}


def test_parse_alternative_names_double_simple():
	"""Simple cases with two alternative names, and proper formatting"""
	
	assert parse_alternative_names("Alternative names:\nREZZ Bass\nSpace Bass") == {"REZZ Bass", "Space Bass"}


def test_parse_alternative_names_single_shortened():
	"""Simple cases where there's one alternative name, and it's a shortened version of the subgenre name"""
	
	assert parse_alternative_names("Alternative names:\nBubblegum (shortened)") == {"Bubblegum"}


def test_parse_alternative_names_single_imperfect():
	"""Cases where the capitalization and number of blank lines could be problematic (with just one alternative name)"""
	
	assert parse_alternative_names("Alternative Names:\nModern Psychedelia") == {"Modern Psychedelia"}
	assert parse_alternative_names("Alternative names:\n\n\n\nModern Psychedelia") == {"Modern Psychedelia"}
	assert parse_alternative_names("Alternative Names:\n\nModern Psychedelia\n\n") == {"Modern Psychedelia"}


def test_parse_alternative_names_short_for():
	"""When the subgenre name is short for another name and has no alternative names"""
	
	assert parse_alternative_names("Short for Melodic Hardcore Punk") == {"Melodic Hardcore Punk"}


def test_parse_alternative_names_combo_simple():
	"""Cases where the subgenre is short for another name, and also has alternative names"""
	
	assert parse_alternative_names("Short for Philadelphia Soul\n\nAlternative names:\nThe Philadelphia Sound") == {"Philadelphia Soul", "The Philadelphia Sound"}


def test_parse_alternative_names_combo_complex():
	"""Cases where the subgenre name is short for another name, has multiple alternative names, at least one of which is a shortened version"""
	
	assert parse_alternative_names("Short for Technical Death Metal\n\nAlternative names:\nProgressive Death Metal\nProgressive Death (shortened)") == {"Technical Death Metal", "Progressive Death Metal", "Progressive Death"}

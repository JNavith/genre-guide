#    genre.guide - Genre parsing test suite
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


from pytest import raises

from ..genre_utils import parse_genre


def test_parse_genre_single():
    "Single-genre cases"
    assert parse_genre("Space Bass") == ("Space Bass", )
    assert parse_genre("Drum & Bass") == ("Drum & Bass", )
    assert parse_genre("Electro House") == ("Electro House", )


def test_parse_genre_double():
    "Two-genre cases"
    assert parse_genre("Space Bass | Drum & Bass") == ("Space Bass", "|",
                                                       "Drum & Bass")
    assert parse_genre("Space Bass > Drum & Bass") == ("Space Bass", ">",
                                                       "Drum & Bass")
    assert parse_genre("Alternative Metal ~ Bubblegum Pop") == (
        "Alternative Metal", "~", "Bubblegum Pop")


def test_parse_genre_triple():
    "Three-genre cases"
    assert parse_genre("Hybrid Trap | Brostep | Electropop") == ("Hybrid Trap",
                                                                 "|",
                                                                 "Brostep",
                                                                 "|",
                                                                 "Electropop")
    assert parse_genre("Bass House > Jungle Terror > Hybrid Trap") == (
        "Bass House", ">", "Jungle Terror", ">", "Hybrid Trap")


def test_parse_genre_quadruple():
    "Four-genre cases (please no)"
    assert parse_genre("Plunderphonics | IDM | Experimental | Noise") == (
        "Plunderphonics", "|", "IDM", "|", "Experimental", "|", "Noise")
    assert parse_genre("Plunderphonics > IDM > Experimental > Noise") == (
        "Plunderphonics", ">", "IDM", ">", "Experimental", ">", "Noise")


def test_parse_genre_triple_with_dividers():
    "Dividing operators (simplest / three genres total)"
    assert parse_genre("Space Bass || Drum & Bass > Brostep") == (
        "Space Bass", "|", ("Drum & Bass", ">", "Brostep"))
    assert parse_genre("Space Bass | Post-Synthpop >> Electro House") == ((
        "Space Bass", "|", "Post-Synthpop"), ">", "Electro House")


def test_parse_genre_triple_in_parentheses():
    "Genres in parentheses"
    assert parse_genre("Space Bass | (Drum & Bass > Brostep)") == (
        "Space Bass", "|", ("Drum & Bass", ">", "Brostep"))
    assert parse_genre("(Space Bass | Post-Synthpop) > Electro House") == ((
        "Space Bass", "|", "Post-Synthpop"), ">", "Electro House")



def test_parse_genre_triple_double_in_parentheses():
    "Genres in parentheses"
    assert parse_genre("(Space Bass ~ Post-Synthpop) | (Drum & Bass > Brostep)") == (
        ("Space Bass", "~", "Post-Synthpop"), "|", ("Drum & Bass", ">", "Brostep"))
    assert parse_genre("(Space Bass | Post-Synthpop) > (Complextro ~ Commercial House)") == (
        ("Space Bass", "|", "Post-Synthpop"), ">", ("Complextro", "~", "Commercial House"))


def test_parse_genre_quadruple_with_dividers():
    "Dividing operators (four genres)"
    assert parse_genre("Ambient || Country > Post-Disco > Drumfunk")
    assert parse_genre("Footwork >> Trap | Wonky | Jungle Terror")


def test_parse_genre_quadruple_with_multiple_same_dividers():
    "Multiple dividing operators of the same type"
    assert parse_genre(
        "Future Bass >> Wonky | Experimental >> Experimental Trap") == (
            "Future Bass", ">", ("Wonky", "|",
                                 "Experimental"), ">", "Experimental Trap")
    assert parse_genre(
        "Future Bass || Wonky > Experimental || Experimental Trap") == (
            "Future Bass", "|", ("Wonky", ">",
                                 "Experimental"), "|", "Experimental Trap")


def test_parse_genre_failure():
    "Forbidden formats"

    with raises(ValueError):
        # Ambiguous grouping of operators (needs a dividing operator)
        parse_genre("Progressive House > Melodic Dubstep | Glitch Hop")

    with raises(ValueError):
        # Ambiguous grouping of operators (needs a dividing operator)
        parse_genre("Commercial House ~ Complextro > Future Bass")

    with raises(ValueError):
        # Too many dividing operators (grouping cannot be determined)
        parse_genre("Moombahton || Tech House >> Wonky")

    with raises(ValueError):
        # Too many dividing operators (grouping cannot be determined)
        parse_genre("Nu-Disco ~~ Vaporwave || Chillwave")

    with raises(ValueError):
        # Malformed (misplaced operator)
        parse_genre("Cloud Rap |")

    with raises(ValueError):
        # Malformed (only operators)
        parse_genre("| | |")

    with raises(ValueError):
        # Malformed (a divider on its own)
        parse_genre(">>")

    with raises(ValueError):
        # Malformed (a few operators)
        parse_genre("> ~ >")

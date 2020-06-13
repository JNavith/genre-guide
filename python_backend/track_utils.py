#    genre.guide - Track utilities
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


from hashlib import blake2b


def id_for_track(*, artist: str, title: str, release_date: str) -> str:
    # Probably the best traits to form a unique ID from
    song_id: str = "\n".join([artist, title, release_date])
    return blake2b(song_id.encode("utf8")).hexdigest()

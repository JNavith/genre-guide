from hashlib import blake2b


def id_for_track(artist: str, title: str, release_date: str) -> str:
	# Probably the best traits to form a unique ID from
	song_id: str = "\n".join([artist, title, release_date])
	return blake2b(song_id.encode("utf8")).hexdigest()

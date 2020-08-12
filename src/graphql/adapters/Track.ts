/*
	genre.guide - GraphQL server: Track adapter
	Copyright (C) 2020 Navith

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

// @ts-ignore -- doesn't package types
import blake from "blakejs";
import { plainToClass } from "class-transformer";
import type { firestore } from "firebase-admin";

import { db } from "../firestore";

import { Track } from "../object-types/Track";

const TRACKS_COLLECTION = "tracks";
export const tracksCollectionRef = db.collection(TRACKS_COLLECTION);

const blake2b = (item: string): string => blake.blake2bHex(item);

export const createTrackID = ({ artist, title, releaseDate }: Pick<Track, "artist" | "title" | "releaseDate">): string => {
	// Probably the best traits to form a unique ID from
	const isoDate = releaseDate.toISOString();
	const [date, _time] = isoDate.split("T");

	const key = [artist, title, date];
	const joined = key.join("\n");
	return blake2b(joined);
};

export const FirestoreToTrack = (documentData: firestore.DocumentData): Track => {
	const clone = { ...documentData };
	clone.releaseDate = clone.releaseDate.toDate();
	return plainToClass(Track, clone);
};

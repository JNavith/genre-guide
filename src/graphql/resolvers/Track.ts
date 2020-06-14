/*
	genre.guide - GraphQL server: Track resolver
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

// @ts-ignore
import blake from "blakejs";
import * as admin from "firebase-admin";
import { plainToClass } from "class-transformer";
import {
	Arg, Args, ArgsType, Field, FieldResolver, ID, Int, Query, Resolver, ResolverInterface, Root,
} from "type-graphql";

import { GraphQLError } from "graphql";
import SubgenreGroup, { convertNestedStrings, NestedStrings } from "../object-types/SubgenreGroup";
import Track from "../object-types/Track";
import { getDocument, db } from "../firestore";
import Operator from "../object-types/Operator";
import Subgenre from "../object-types/Subgenre";

const TRACKS_COLLECTION = "tracks";
const tracksCollectionRef = db.collection(TRACKS_COLLECTION);

const blake2b = (item: string): string => blake.blake2bHex(item);

const createTrackID = ({ artist, title, releaseDate }: { artist: string, title: string, releaseDate: string }): string => {
	// Probably the best traits to form a unique ID from
	const key = [artist, title, releaseDate];
	const joined = key.join("\n");
	return blake2b(joined);
};

const FirestoreToTrack = (documentData: admin.firestore.DocumentData): Track => {
	const clone = { ...documentData };
	clone.releaseDate = clone.releaseDate.toDate();
	return plainToClass(Track, clone);
};

@ArgsType()
class TracksArguments {
	@Field((type) => Date, { nullable: true, description: "The newest date of songs to retrieve (inclusive)" })
	beforeDate?: Date;

	@Field((type) => Date, { nullable: true, description: "The oldest date of songs to retrieve (inclusive)" })
	afterDate?: Date;

	@Field((type) => ID, { nullable: true, description: "The newest song to retrieve (exclusive) by its ID. Do not set any other parameter than `limit` when using this" })
	beforeID?: string;

	@Field((type) => ID, { nullable: true, description: "The oldest song to retrieve (exclusive) by its ID. Do not set any other parameter than `limit` when using this" })
	afterID?: string;

	@Field((type) => Boolean, { nullable: true, description: "Whether to sort the returned tracks from newest to oldest, or oldest to newest" })
	newestFirst?: boolean;

	@Field((type) => Int, { nullable: true, description: "The maximum number of tracks to return" })
	limit?: number;
}

@Resolver((of) => Track)
export class TrackResolver implements ResolverInterface<Track> {
	@Query((returns) => [Track], { description: "Retrieve a range of tracks from the sheet (database)" })
	async tracks(@Args() {
		beforeDate, afterDate, beforeID, afterID, newestFirst = true, limit: passedLimit = 50,
	}: TracksArguments) {
		const tracks: Track[] = [];
		const limit = Math.max(0, Math.min(passedLimit, 500));

		const trackQuery = tracksCollectionRef.orderBy("releaseDate", "desc").limit(limit);
		const trackDocs = await trackQuery.get();

		trackDocs.forEach((trackDoc) => {
			const trackDocData = trackDoc.data();
			if (trackDocData) {
				tracks.push(FirestoreToTrack(trackDoc.data()));
			} else {
				throw new GraphQLError("somehow there was no database entry for a track that was expected to exist");
			}
		});

		return tracks;
	}

	@Query((returns) => Track, { nullable: true, description: "Retrieve a particular track from the sheet (database), or null if it cannot be found" })
	async track(@Arg("id", (type) => ID, { description: "The ID of the track to retrieve" }) id: string) {
		const documentRef = await getDocument("tracks", id);
		const documentData = documentRef.data();
		if (documentData) {
			return FirestoreToTrack(documentData);
		}
		throw new GraphQLError(`the track with ID ${id} doesn't exist in the database (which doesn't contain all the tracks on the Genre Sheet nor Subgenre Sheet)`);
	}

	@FieldResolver()
	async id(@Root() track: Track) {
		const isoDate = track.releaseDate.toISOString();
		const [date, _time] = isoDate.split("T");
		const key = { artist: track.artist, title: track.title, releaseDate: date };
		return createTrackID(key);
	}

	@FieldResolver()
	async subgenresNestedAsSubgenres(@Root() track: Track) {
		try {
			console.log(track.subgenresNested);
			const nested: NestedStrings = JSON.parse(track.subgenresNested);
			if (Array.isArray(nested)) {
				const promises = nested.map(convertNestedStrings);
				const typed = await Promise.all(promises);
				return new SubgenreGroup(typed);
			}
			const typed = await convertNestedStrings(nested);
			if (typed instanceof SubgenreGroup) {
				return typed;
			}
			return new SubgenreGroup([typed]);
		} catch (e) {
			console.log(e);
			console.log(track);
			return new SubgenreGroup([]);
		}
	}

	@FieldResolver()
	async subgenresFlat(@Root() track: Track) {
		const nested = JSON.parse(track.subgenresNested);
		const flat = nested.flat(Infinity);
		const typed = await convertNestedStrings(flat) as any as SubgenreGroup;
		return typed._elements as (Operator | Subgenre)[];
	}

	@FieldResolver()
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async image(@Root() track: Track) {
		// TODO: Find an external API that would let us query them for artwork
		return undefined;
	}
}

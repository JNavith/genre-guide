/*
    genre.guide - GraphQL server: Track and resolver TypeScript file
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


import "reflect-metadata";
import {
	Arg, Args, ArgsType, ObjectType, Field, FieldResolver, ID, Int, Query, Resolver, ResolverInterface, Root,
} from "type-graphql";

import { generatorFilter, generatorMap } from "../globals/utils";
import { convertNestedStringsToTypes, SubgenreGroup, SubgenreOrOperator } from "./SubgenreGroup";
import { client } from "./redis";


const allDates = function* (date: Date, step: number): Generator<Date> {
	while (true) {
		yield date;
		date = new Date(date.getTime());
		date.setDate(date.getDate() + step);
	}
};

const allDatesBefore = (date: Date): Generator<Date> => allDates(date, -1);
const allDatesAfter = (date: Date): Generator<Date> => allDates(date, +1);

const dateString = (date: Date): string => `${date.toISOString().slice(0, 10)}`;
const dateKey = (date: Date): string => `date:${dateString(date)}`;

const getTracksFromDateKeys = async function* (dateKeys: Generator<string>): AsyncIterator<string> {
	for (const key of dateKeys) {
		for (const trackID of await client.lrange(key, 0, -1)) {
			yield trackID;
		}
	}
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

@ObjectType({ description: "A track / song, as may appear on the Genre Sheet" })
export class Track {
	constructor(
        readonly _id: string,
	) { }

    @Field((type) => ID, { description: "The unique ID associated with this track, for lookup purposes" })
    id?: string;

    @Field({ description: "The name of the track" })
    name?: string;

    @Field({ description: "The artist(s) of the track" })
    artist?: string;

    @Field({ description: "The record label(s) or copyright owner(s) who released and/or own the rights to the track" })
    recordLabel?: string;

    @Field({ description: "The date the track was released" })
    date?: Date;

    @Field((type) => SubgenreGroup, { description: "The subgenres and dividers that make up this song, but recursive and hard to work with (though fully accurate and reflective of entries on the Genre Sheet)" })
    subgenresNested?: SubgenreGroup;

    @Field((type) => [SubgenreOrOperator], { description: "The subgenres and dividers that make up this song, flattened out for simplicity (but with loss of information)" })
    subgenresFlat?: any;

    @Field((type) => String, { nullable: true, description: "The link to the cover artwork for the track, or null if none is known (currently all tracks return null)" })
    image?: string | null;
}

@Resolver((of) => Track)
export class TrackResolver implements ResolverInterface<Track> {
    @Query((returns) => [Track], { description: "Retrieve a range of tracks from the sheet (database)" })
	async tracks(@Args() {
		beforeDate, afterDate, beforeID, afterID, newestFirst = true, limit = 50,
	}: TracksArguments) {
		const trackIDs: string[] = [];
		limit = Math.max(0, Math.min(limit, 1000));

        const validDates = await client.smembers("dates");

		let selectedTracks: AsyncIterator<string>;
		// todo: use newest first to help
		if ((beforeDate || afterDate) || (!beforeID && !afterID)) {
			let dateRange: Generator<Date>;

			if (beforeDate && afterDate) dateRange = generatorFilter(newestFirst ? allDatesBefore(beforeDate) : allDatesAfter(afterDate), (date) => date >= afterDate);
			else if (beforeDate) dateRange = allDatesBefore(beforeDate);
			else if (afterDate) dateRange = allDatesAfter(afterDate);
			else dateRange = allDatesBefore(new Date());

			const validDateRange = generatorFilter(dateRange, (date) => validDates.includes(dateString(date)));
			selectedTracks = getTracksFromDateKeys(generatorMap(validDateRange, dateKey));
		} else if (beforeID) {
			// todo
		} else {
			// todo
		}

		while (trackIDs.length < limit) {
			trackIDs.push((await selectedTracks!.next()).value);
		}

		return trackIDs.map((trackID) => new Track(trackID));
	}

    @Query((returns) => Track, { nullable: true, description: "Retrieve a particular track from the sheet (database), or null if it cannot be found" })
    async track(@Arg("id", (type) => ID, { description: "The ID of the track to retrieve" }) id: string) {
    	if (await client.sismember("tracks", id)) {
    		return new Track(id);
    	}

    	return null;
    }

    @FieldResolver()
    async id(@Root() track: Track) {
    	return track._id;
    }

    @FieldResolver()
    async name(@Root() track: Track) {
    	const name = await client.hget(`track:${track._id}`, "track");
    	return name!;
    }

    @FieldResolver()
    async artist(@Root() track: Track) {
    	const artist = await client.hget(`track:${track._id}`, "artist");
    	return artist!;
    }

    @FieldResolver()
    async recordLabel(@Root() track: Track) {
    	const recordLabel = await client.hget(`track:${track._id}`, "label");
    	return recordLabel!;
    }

    @FieldResolver()
    async date(@Root() track: Track) {
    	const release = await client.hget(`track:${track._id}`, "release");
    	const [year, month, day] = release!.split("-");
    	const date = new Date(0);
    	date.setFullYear(Number(year), Number(month) - 1, Number(day) - 1);
    	return date;
    }

    @FieldResolver()
    async subgenresNested(@Root() track: Track) {
    	const recursive = await client.hget(`track:${track._id}`, "subgenre");
    	const parsed = JSON.parse(recursive!);
    	const typed = parsed.map(convertNestedStringsToTypes);
    	return new SubgenreGroup(typed);
    }

    @FieldResolver()
    async subgenresFlat(@Root() track: Track) {
    	const recursive = await client.hget(`track:${track._id}`, "subgenre");
    	const flat = JSON.parse(recursive!).flat(Infinity);
    	return flat.map(convertNestedStringsToTypes);
    }

    @FieldResolver()
    async image(@Root() track: Track) {
    	// TODO: Find an external API that would let us query them for artwork
    	return null;
    }
}

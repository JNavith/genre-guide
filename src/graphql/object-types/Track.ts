/*
	genre.guide - GraphQL server: Track object type
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

import { Field, ID, ObjectType, Int } from "type-graphql";

import SubgenreGroup, { SubgenreOrOperator } from "./SubgenreGroup";
import Subgenre from "./Subgenre";
import Operator from "./Operator";

@ObjectType({ description: "A track / song, as may appear on the Genre Sheet" })
export default class Track {
	@Field((type) => ID, { description: "The unique ID associated with this track, for lookup purposes" })
	id?: string;

	@Field({ description: "The artist(s) of the track" })
	artist!: string;

	@Field({ name: "name", description: "The name of the track" })
	title!: string;

	@Field({ name: "date", description: "The date the track was released", deprecationReason: "Use releaseDate instead because it's a more specific name" })
	@Field({ description: "The date the track was released" })
	releaseDate!: Date;


	@Field({ description: "The record label(s) or copyright owner(s) who released and/or own the rights to the track" })
	recordLabel!: string;

	indexOnLabelOnRelease!: number;


	subgenresNested!: string;

	@Field((type) => SubgenreGroup, { name: "subgenresNested", description: "The subgenres and operators that make up this song, but recursive and hard to work with (though fully accurate and reflective of entries on the Genre Sheet and Subgenre Sheet)" })
	subgenresNestedAsSubgenres?: SubgenreGroup;

	@Field((type) => [SubgenreOrOperator], { description: "The subgenres and operators that make up this song, flattened out for simplicity (but with loss of information)" })
	subgenresFlat?: (Subgenre | Operator)[];


	length!: string | undefined;

	@Field((type) => Int, { nullable: true, name: "length", description: "The length of the track in seconds" })
	lengthSeconds?: number;

	// TODO: reuse parse_genre logic
	@Field((type) => String, { nullable: true, description: "The tempo in beats per minute (BPM), which may change throughout the track runtime (signified with >)" })
	bpm!: string | undefined;

	// TODO: reuse parse_genre logic
	@Field((type) => String, { nullable: true, description: "The key, which may change throughout the track runtime (signified with > or /)" })
	key!: string | undefined;
	
	sourceSheetName!: string;
	sourceSheetID!: string;

	sourceTabName!: string;
	sourceTabID!: number;

	sourceRow!: number;

	@Field((type) => String, { description: "A direct link to the source of all the information we have for this track" })
	source?: string;

	@Field((type) => String, { nullable: true, description: "The link to the cover artwork for the track, or null if none is known (currently all tracks return null)" })
	image?: string;
}

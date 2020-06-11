/*
    genre.guide - GraphQL server: Subgenre and resolver TypeScript file
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
	ObjectType, Field, FieldResolver, Query, Resolver, ResolverInterface, Root,
} from "type-graphql";

import { client } from "./redis";

@ObjectType({ description: "A subgenre, as understood on the Genre Sheet" })
export class Subgenre {
	constructor(
        readonly primaryName: string,
	) { }

    @Field((type) => [String], { description: "The primary name of the subgenre, e.x. \"Brostep\", followed by alternative names for the subgenre, e.x. {\"DnB\", \"D&B\"} for Drum & Bass" })
    names?: string[];

    @Field((type) => Subgenre, { description: "The genre category that this subgenre belongs to, which is where its color comes from, e.x. Vaporwave for Vaportrap, Future Bass for Future Bass" })
    category?: this;

    @Field((type) => [Subgenre], { description: "The list of subgenres that this subgenre comes *directly* from, e.x. {Detroit Techno,} for Big Room Techno, {UK Hip Hop, 2-Step Garage} for Grime" })
    origins?: this[];

    @Field((type) => [Subgenre], { description: "The list of subgenres that originate *directly* from this subgenre, e.x. {Deathstep, Drumstep} for Dubstep, {} for Footwork, {Electro Swing, Jazzstep} for Nu-Jazz" })
    children?: this[];

    @Field((type) => String, { description: "The text color this subgenre uses on the Genre Sheet, in hex, e.x. '#000000' for Ambient" })
    textColor?: string;

    @Field((type) => String, { description: "The background color this subgenre uses on the Genre Sheet, in hex, e.x. '#009600' for Hardcore" })
    backgroundColor?: string;

    @Field((type) => String, { nullable: true, description: "A paragraph describing of this subgenre. Currently, no descriptions are available for any subgenre, so this always returns null" })
    description?: string | null;
}

@Resolver((of) => Subgenre)
export class SubgenreResolver implements ResolverInterface<Subgenre> {
    @Query((returns) => [Subgenre], { description: "Retrieve all subgenres from the sheet (database)" })
	async allSubgenres(): Promise<Subgenre[]> {
		return (await client.smembers("subgenres")).map((primaryName) => new Subgenre(primaryName));
	}

    @Query((returns) => [Subgenre], { description: "Retrieve all categories (genres) from the sheet (database)" })
    async allCategories() {
    	return (await client.smembers("genres")).map((primaryName) => new Subgenre(primaryName));
    }

    @FieldResolver()
    async names(@Root() subgenre: Subgenre) {
    	const alternativeNames = await client.hget(`subgenre:${subgenre.primaryName}`, "alternative_names");
    	const parsed = JSON.parse(alternativeNames!);
    	return [subgenre.primaryName, ...(parsed === null ? [] : parsed)];
    }

    @FieldResolver()
    async category(@Root() subgenre: Subgenre) {
        // Someone, somewhere, used Trap ambiguously so we have to fix that here and hope we're right
        if (subgenre.primaryName === "Trap") return new Subgenre("Trap (EDM)");

    	const genre = await client.hget(`subgenre:${subgenre.primaryName}`, "genre");
        if (genre !== null) return new Subgenre(genre);

        const [, subgenreWithRightParenthesis] = subgenre.primaryName.split("(");
        return new Subgenre(subgenreWithRightParenthesis.substring(0, subgenreWithRightParenthesis.length - 1));
    }

    @FieldResolver()
    async origins(@Root() subgenre: Subgenre) {
    	const origins = await client.hget(`subgenre:${subgenre.primaryName}`, "origins");
    	return JSON.parse(origins!).map((primaryName: string) => new Subgenre(primaryName));
    }

    @FieldResolver()
    async children(@Root() subgenre: Subgenre) {
    	const children = await client.hget(`subgenre:${subgenre.primaryName}`, "subgenres");
    	return JSON.parse(children!).map((primaryName: string) => new Subgenre(primaryName));
    }

    @FieldResolver()
    async textColor(@Root() subgenre: Subgenre): Promise<string> {
    	if (subgenre.primaryName === null) return "#FFFFFF";
    	const colors = await client.hget(`subgenre:${subgenre.primaryName}`, "color");
    	// Return the category's color if this subgenre does not have color information stored in the database
    	if (colors === "null" || colors === null) {
    		return await this.textColor(await this.category(subgenre));
    	}
    	return JSON.parse(colors)[1];
    }

    @FieldResolver()
    async backgroundColor(@Root() subgenre: Subgenre): Promise<string> {
    	if (subgenre.primaryName === null) return "#000000";
    	const colors = await client.hget(`subgenre:${subgenre.primaryName}`, "color");
    	// Return the category's color if this subgenre does not have color information stored in the database
    	if (colors === "null" || colors === null) {
    		return await this.backgroundColor(await this.category(subgenre));
    	}
    	return JSON.parse(colors)[0];
    }

    @FieldResolver()
    async description(@Root() subgenre: Subgenre) {
    	// TODO: allow for descriptions to exist
    	return null;
    }
}

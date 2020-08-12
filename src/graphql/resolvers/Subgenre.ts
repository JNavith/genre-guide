/*
	genre.guide - GraphQL server: Subgenre resolver
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

import { GraphQLError } from "graphql";
import {
	Arg, FieldResolver, Query, Resolver, ResolverInterface, Root,
} from "type-graphql";
import { getAll as getAllSubgenres, getOne as getOneSubgenre } from "../adapters/Subgenre";
import { Subgenre } from "../object-types/Subgenre";

@Resolver(Subgenre)
export class SubgenreResolver implements ResolverInterface<Subgenre> {
	@Query((returns) => Subgenre, { description: "Get information about a subgenre from (one of its) exact name(s)" })
	subgenre(@Arg("name") name: string) {
		return getOneSubgenre({ anyName: name });
	}

	@Query((returns) => [Subgenre], { description: "Retrieve all subgenres from the sheet (database)" })
	allSubgenres() {
		return getAllSubgenres();
	}

	@Query((returns) => [Subgenre], { description: "Retrieve all categories (genres) from the sheet (database)" })
	async allCategories() {
		const subgenres = await getAllSubgenres();
		return subgenres.filter((subgenre) => subgenre.names.includes(subgenre.category));
	}

	@FieldResolver()
	async categorySubgenre(@Root() subgenre: Subgenre) {
		try {
			return await getOneSubgenre({ primaryName: subgenre.category });
		} catch (e) {
			throw new GraphQLError(`there was no database entry for the ${subgenre.category} subgenre (${subgenre.names[0]}'s category)`);
		}
	}

	@FieldResolver()
	parents(@Root() subgenre: Subgenre) {
		const originsPromises = subgenre.origins.map(async (origin) => getOneSubgenre({ primaryName: origin }));
		try {
			return Promise.all(originsPromises);
		} catch (e) {
			throw new GraphQLError(`somehow there was no database entry for one of ${subgenre.names[0]}'s parent subgenres`);
		}
	}

	@FieldResolver()
	childrenSubgenres(@Root() subgenre: Subgenre): Promise<Subgenre[]> {
		const childrenPromises = subgenre.children.map(async (child) => getOneSubgenre({ primaryName: child }));
		try {
			return Promise.all(childrenPromises);
		} catch (e) {
			throw new GraphQLError(`somehow there was no database entry for one of ${subgenre.names[0]}'s children subgenres`);
		}
	}

	@FieldResolver()
	async description(@Root() _subgenre: Subgenre) {
		// TODO: allow for descriptions to exist
		return undefined;
	}
}

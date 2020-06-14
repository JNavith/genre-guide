/*
	genre.guide - GraphQL server: Subgenre Group object type
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

import {
	createUnionType, Field, ObjectType, Root,
} from "type-graphql";

import Subgenre from "./Subgenre";
import Operator, { GenreSymbol, symbols } from "./Operator";
import { getDocument } from "../firestore";
import { FirestoreToSubgenre, SUBGENRES_COLLECTION } from "../resolvers/Subgenre";

@ObjectType({ description: "A (recursive) group of subgenres and operators" })
export default class SubgenreGroup {
	constructor(
		readonly _elements: NestedTypes[],
	) { }

	// eslint-disable-next-line no-use-before-define
	@Field((type) => [SubgenreOrOperatorOrGroup], { description: "The elements of this group" })
	async elements(@Root() subgenreGroup: SubgenreGroup): Promise<NestedTypes[]> {
		return subgenreGroup._elements;
	}
}

export type NestedStrings = (string | GenreSymbol | NestedStrings)[] | string | GenreSymbol;
export type NestedTypes = Subgenre | Operator | SubgenreGroup;

export const SubgenreOrOperator = createUnionType({
	name: "SubgenreOrOperator",
	types: () => [Subgenre, Operator],
	resolveType: (element) => {
		if ("_symbol" in element) return Operator;
		return Subgenre;
	},
});

export const SubgenreOrOperatorOrGroup = createUnionType({
	name: "SubgenreOrOperatorOrGroup",
	types: () => [Subgenre, Operator, SubgenreGroup],
	resolveType: (element) => {
		if ("_symbol" in element) return Operator;
		if ("_elements" in element) return SubgenreGroup;
		return Subgenre;
	},
});

const makeSubgenreKnown = (questionableSubgenre: string): [boolean, string] => {
	// Look for ? (Genre)
	const findUnknown = /\? \((.+)\)/;
	const match = questionableSubgenre.match(findUnknown);
	// Return the part in the parentheses
	if (match) {
		const [_match, group, ..._rest] = match;
		return [true, group];
	}
	// If it's not there, just outright turn what was passed in because it must be known
	return [false, questionableSubgenre];
};

export const convertNestedStrings = async (nestedStrings: NestedStrings): Promise<NestedTypes> => {
	if (Array.isArray(nestedStrings)) {
		const promises = nestedStrings.map(convertNestedStrings);
		return new SubgenreGroup(await Promise.all(promises));
	}

	if (Object.prototype.hasOwnProperty.call(symbols, nestedStrings)) {
		return new Operator(nestedStrings as GenreSymbol);
	}

	// Look up Genre in place of ? (Genre)
	const [wasUnknown, knownSubgenre] = makeSubgenreKnown(nestedStrings);
	// TODO: not have to workaround ambiguous Trap
	const subgenre = knownSubgenre === "Trap" ? "Trap (EDM)" : knownSubgenre;

	const subgenreDoc = await getDocument(SUBGENRES_COLLECTION, subgenre);
	const subgenreDocData = subgenreDoc.data();
	if (subgenreDocData) {
		const objectType = FirestoreToSubgenre(subgenreDocData);
		if (wasUnknown) {
			// Reinstate the ? (Genre) name
			objectType.names = [`? (${objectType.names[0]})`];
		}
		return objectType;
	}

	throw new TypeError(`somehow there was no database entry for the ${subgenre} subgenre when it's expected to exist`);
};

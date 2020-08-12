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

import { plainToClass } from "class-transformer";
import {
	createUnionType, Field, ObjectType, Root,
} from "type-graphql";

import { Subgenre } from "./Subgenre";
import { GenreSymbol, Operator, symbols } from "./Operator";
import { getOne as getOneSubgenre } from "../adapters/Subgenre";

@ObjectType({ description: "A recursive group of subgenres and operators" })
export class SubgenreGroup {
	// eslint-disable-next-line no-useless-constructor
	constructor(
		readonly _elements: NestedTypes[],
	) { }

	// eslint-disable-next-line no-use-before-define
	@Field((type) => [SubgenreOrOperatorOrGroup], { description: "The elements of this group" })
	async elements(@Root() subgenreGroup: SubgenreGroup): Promise<NestedTypes[]> {
		// eslint-disable-next-line no-underscore-dangle
		return subgenreGroup._elements;
	}
}

export type NestedStrings = (string | GenreSymbol | NestedStrings)[] | string | GenreSymbol;
export type NestedTypes = Subgenre | Operator | SubgenreGroup;

export const SubgenreOrOperator = createUnionType({
	name: "SubgenreOrOperator",
	types: () => [Subgenre, Operator],
	resolveType: (element) => {
		if ("symbol" in element) return Operator;
		return Subgenre;
	},
});

export const SubgenreOrOperatorOrGroup = createUnionType({
	name: "SubgenreOrOperatorOrGroup",
	types: () => [Subgenre, Operator, SubgenreGroup],
	resolveType: (element) => {
		if ("symbol" in element) return Operator;
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
		return plainToClass(Operator, { symbol: nestedStrings as GenreSymbol });
	}

	// Look up Genre in place of ? (Genre)
	const [wasUnknown, knownSubgenre] = makeSubgenreKnown(nestedStrings);
	// TODO: not have to workaround ambiguous Trap
	const anyName = knownSubgenre === "Trap" ? "Trap (EDM)" : knownSubgenre;

	const subgenre = await getOneSubgenre({ anyName });
	if (wasUnknown) {
		// Reinstate the ? (Genre) name(s)
		subgenre.names = subgenre.names.map((name) => `? (${name})`);
	}
	return subgenre;
};

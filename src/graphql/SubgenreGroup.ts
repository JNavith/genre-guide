/*
    genre.guide - GraphQL server: SubgenreGroup TypeScript file
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
	createUnionType, Field, ObjectType, Root,
} from "type-graphql";

import { Subgenre } from "./Subgenre";
import { Operator, GenreSymbol, symbols } from "./Operator";


@ObjectType({ description: "A (recursive) group of subgenres and operators" })
export class SubgenreGroup {
	constructor(
        readonly _elements: NestedTypes[],
	) { }

	// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-use-before-define
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


export const convertNestedStringsToTypes = (nestedStrings: NestedStrings): NestedTypes => {
	if (Array.isArray(nestedStrings)) return new SubgenreGroup(nestedStrings.map(convertNestedStringsToTypes));
	if (Object.keys(symbols).includes(nestedStrings)) return new Operator(nestedStrings as GenreSymbol);
	return new Subgenre(nestedStrings);
};

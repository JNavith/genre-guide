/*
	genre.guide - GraphQL server: Operator and resolver TypeScript file
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
	ObjectType, Field, FieldResolver, Resolver, ResolverInterface, Root,
} from "type-graphql";

export type GenreSymbol = "|" | ">" | "~";
export const symbols = {
	"|": {
		name: "Dual",
	},
	">": {
		name: "Transition",
	},
	"~": {
		name: "Back and Forth",
	},
};


@ObjectType({ description: "An operator or divider between the multiple subgenres of a track" })
export class Operator {
	constructor(
		readonly _symbol: GenreSymbol,
	) { }

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	@Field((type) => String, { description: "A one-character symbol for the operator" })
	symbol?: string;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	@Field((type) => String, { description: "A short, descriptive name for the operator" })
	name?: string;
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
@Resolver((of) => Operator)
export class OperatorResolver implements ResolverInterface<Operator> {
	@FieldResolver()
	async symbol(@Root() operator: Operator): Promise<GenreSymbol> {
		return operator._symbol;
	}

	@FieldResolver()
	async name(@Root() operator: Operator): Promise<string> {
		return symbols[operator._symbol].name;
	}
}

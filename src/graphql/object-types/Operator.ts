/*
	genre.guide - GraphQL server: Operator object type
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

import { Field, ObjectType } from "type-graphql";

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

export type GenreSymbol = keyof typeof symbols;

@ObjectType({ description: "An operator or divider between the multiple subgenres of a track" })
export class Operator {
	@Field((type) => String, { description: "A one-character symbol for the operator" })
	symbol!: GenreSymbol;

	@Field((type) => String, { description: "A short, descriptive name for the operator" })
	get name(): string {
		return symbols[this.symbol].name;
	}
}

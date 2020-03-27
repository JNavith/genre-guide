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
import { ObjectType, Field, FieldResolver, Resolver, ResolverInterface, Root } from "type-graphql";

export type Symbol = "|" | ">" | "~";
export const symbols = {
    "|": {
        name: "Dual",
    },
    ">": {
        name: "Transition"
    },
    "~": {
        name: "Back and Forth",
    }
};


@ObjectType({ description: "An operator or divider between the multiple subgenres of a track" })
export class Operator {
    constructor(
        readonly _symbol: Symbol,
    ) { }

    @Field(type => String, { description: "A one-character symbol for the operator" })
    symbol?: string;

    @Field(type => String, { description: "A short, descriptive name for the operator" })
    name?: string;
}


@Resolver(of => Operator)
export class OperatorResolver implements ResolverInterface<Operator> {
    @FieldResolver()
    async symbol(@Root() operator: Operator) {
        return operator._symbol;
    }

    @FieldResolver()
    async name(@Root() operator: Operator) {
        return symbols[operator._symbol].name;
    }
}

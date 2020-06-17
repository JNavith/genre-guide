/*
	genre.guide - Main GraphQL server TypeScript file
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
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";

import { SubgenreResolver } from "./resolvers/Subgenre";
import { TrackResolver } from "./resolvers/Track";

export const createApolloServer = async (): Promise<ApolloServer> => {
	const schema = await buildSchema({
		dateScalarMode: "isoDate",
		resolvers: [SubgenreResolver, TrackResolver],
	});

	const apolloServer = new ApolloServer({
		schema,
		playground: true,
		introspection: true,
	});

	return apolloServer;
};

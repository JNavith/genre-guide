/*
	genre.guide - Sapper server entrypoint
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

// @ts-ignore -- generated package
import * as sapper from "@sapper/server"; // eslint-disable-line import/no-unresolved
import compression from "compression";
import express, { Express } from "express";
import helmet from "helmet";
// @ts-ignore -- doesn't package its own types until 1.0.0-next.6
import sirv from "sirv";
import { createApolloServer } from "./graphql";

const PORT = process.env.PORT; // eslint-disable-line prefer-destructuring
// @ts-ignore -- creates a warning after `rollup-plugin-replace` (set up in `rollup.config.js`)
// replaces `process.env.NODE_ENV` with `"production"` during `prod`
const dev = process.env.NODE_ENV === "development";

const main = require.main === module || !!(require.main?.filename.match(/__sapper__\/build\/index.js$/));

const ONLY_GRAPHQL_SERVER = !!process.env.ONLY_GRAPHQL_SERVER; // eslint-disable-line prefer-destructuring

export const sapperify = (app: Express): void => {
	if (main) {
		app.use(sirv("static", { dev }));
	}

	// Use helmet to increase security during production
	if (!dev) {
		app.use(helmet({
			contentSecurityPolicy: false,
		}));
	}

	app.use(
		compression({ threshold: 0 }),
		sapper.middleware(),
	);
};

export const createApolloServerExpress = async (path = "/graphql"): Promise<Express> => {
	const app = express();

	const apolloServer = await createApolloServer();
	apolloServer.applyMiddleware({ app, path });

	return app;
};

export const createSapperAndApolloServer = async (graphqlPath = "/graphql"): Promise<Express> => {
	const app = await createApolloServerExpress(graphqlPath);

	if (!ONLY_GRAPHQL_SERVER) {
		sapperify(app);
	}

	return app;
};

if (main) {
	createSapperAndApolloServer("/graphql").then((app) => {
		app.listen(PORT, (err?: any): void => { // eslint-disable-line
			if (err) console.log("error", err);
		});
	});
}

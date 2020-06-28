/*
	genre.guide - Cloud Functions for Firebase
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

const express = require("express");
const { https: { onRequest } } = require("firebase-functions");

const { createApolloServerExpress, createSapperAndApolloServer, sapperify } = require("./__sapper__/build/server/server");

// const apolloServerExpressPromise = createApolloServerExpress();

// exports.graphqlServer = onRequest(async (...args) => {
// 	const apolloServerExpress = await apolloServerExpressPromise;

// 	return apolloServerExpress(...args);
// });

// const sapperApp = express();
// sapperify(sapperApp);
// exports.ssr = onRequest(sapperApp);

const appPromise = createSapperAndApolloServer();

exports.ssr = onRequest(async (...args) => {
	const app = await appPromise;

	return app(...args);
});

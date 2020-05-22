/*
    genre.guide - Sapper server JavaScript file
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

import * as sapper from "@sapper/server";
import compression from "compression";
import express from "express";
import sirv from "sirv";
import { createApolloServer } from "./graphql/index.ts";

const { PORT, NODE_ENV, RUN_LOCALLY = undefined } = process.env;
const dev = NODE_ENV === "development";


const createSapperAndApolloServer = async (graphqlPath = "/graphql") => {
    const app = express();

    const apolloServer = await createApolloServer();

    apolloServer.applyMiddleware({ app, path: graphqlPath });

    if (dev || RUN_LOCALLY) {
        app.use(sirv("static", { dev }));
    }

    app.use(
        compression({ threshold: 0 }),
        sapper.middleware(),
    );

    return app;
};

if (dev || RUN_LOCALLY) {
    createSapperAndApolloServer().then((app) => {
        app.listen(PORT, (err) => {
            if (err) console.log("error", err);
        });
    });
}

export { createSapperAndApolloServer, sapper };

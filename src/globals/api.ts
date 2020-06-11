/*
    genre.guide - API interaction TypeScript file
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

import { Response as FetchResponse, RequestInfo, RequestInit } from "node-fetch";
import { ExecutionResult as GraphQLExecutionResult } from "graphql";

import { domain } from "./site";

// @ts-ignore
// eslint-disable-next-line global-require,import/no-unresolved
if (!process.browser) global.AbortController = require("abort-controller");

export type FetchFunction = (url: RequestInfo, init?: RequestInit) => Promise<FetchResponse>;

export interface Variables {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[propName: string]: any;
}

export interface APIOptions {
	fetch: FetchFunction;
	query: string;
	variables: Variables;
}

export type APIResponse = GraphQLExecutionResult;

export default async ({ fetch: fetch_, query, variables }: APIOptions): Promise<APIResponse> => {
	const response = await fetch_(
		`${domain}/graphql`,
		{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				query,
				variables,
			}),
		},
	);

	const { data, errors } = await response.json();
	return { data, errors };
};

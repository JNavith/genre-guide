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

import { GraphQLFormattedError } from "graphql";

import { domain } from "./site";

export type NodeFetchFunction = typeof import("node-fetch").default;
export type BrowserFetchFunction = typeof fetch;
export type FetchFunction = NodeFetchFunction | BrowserFetchFunction;

export interface Variables {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	[propName: string]: any;
}

export interface APIOptions {
	fetch: FetchFunction;
	query: string;
	variables?: Variables;
}

export type APIResponse = {
	data: any;
};

export class APIError extends Error {
	errors: GraphQLFormattedError[];

	constructor(errors: GraphQLFormattedError[]) {
		const messages = JSON.stringify(errors.map(({ message }) => message));
		super(`There's at least one error: ${messages}`);
		this.name = "APIError";
		this.errors = errors;
		Object.setPrototypeOf(this, APIError.prototype);
	}
}

export default async ({ fetch, query, variables }: APIOptions): Promise<APIResponse> => {
	const response = await fetch(
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
	if (errors) {
		throw new APIError(errors);
	}
	return { data };
};

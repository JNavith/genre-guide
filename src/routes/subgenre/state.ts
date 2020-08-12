/*
	genre.guide - Subgenre page state management
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

import {
	createMachine, guard, invoke, state, transition, reduce,
} from "robot3";
import { writable } from "svelte/store";
import { call, FetchFunction } from "api";
import { Await, SerializableError, serializeError } from "utils";
import type { Subgenre } from "../../graphql/object-types/Subgenre";

const SUBGENRE_FRAGMENT = `
	backgroundColor
	children {
		names
	}
	description
	names
	parents {
		names
	}
	textColor
`;

const GET_ONE_SUBGENRE = `
	query getSubgenre($name: String!) {
		subgenre(name: $name) {
			${SUBGENRE_FRAGMENT}
		}
	}
`;

const loadSubgenre = async ({ fetch, anyName }: Context) => {
	const variables = {
		name: anyName,
	};

	console.log("I'm fetching here!!!");

	const { data } = await call({ fetch, query: GET_ONE_SUBGENRE, variables });
	const subgenre: Subgenre = data?.subgenre;
	return subgenre;
};

export interface Context {
	error: SerializableError;
	anyName: string;
	subgenre: Subgenre;
	fetch: FetchFunction;
}

export enum State {
	Empty = "empty",
	Error = "error",
	Loaded = "loaded",
	Loading = "loading",
}

export enum Send {
	Load = "load",
}

export const createStateMachine = (initialContext: Partial<Context>, initialState?: State) => createMachine(initialState ?? State.Empty, {
	[State.Empty]: state(
		transition(Send.Load, State.Loading, reduce((ctx: Partial<Context>, { anyName, fetch }: { anyName: string, fetch: FetchFunction }): Partial<Context> & Pick<Context, "anyName" | "fetch"> => ({ ...ctx, anyName, fetch }))),
	),

	[State.Loading]: invoke(
		loadSubgenre,
		transition("done", State.Loaded,
			reduce((ctx: Partial<Context>, { data }: { data: Await<ReturnType<typeof loadSubgenre>> }): Partial<Context> & Pick<Context, "subgenre"> => ({ ...ctx, subgenre: data, fetch: undefined }))),
		transition("error", State.Error,
			reduce((ctx: Partial<Context>, { error }: { error: Error }): Partial<Context> & Pick<Context, "error"> => ({ ...ctx, error: serializeError(error), fetch: undefined }))),
	),

	[State.Loaded]: state(
		transition(Send.Load, State.Loading,
			guard((ctx: Partial<Context>, { anyName }: { anyName: string }) => (ctx.subgenre ? ctx.subgenre.names.includes(anyName) : true)), reduce((ctx: Partial<Context>, { anyName, fetch }: { anyName: string, fetch: FetchFunction }): Partial<Context> & Pick<Context, "anyName" | "fetch"> => ({ ...ctx, anyName, fetch }))),
	),

	[State.Error]: state(
		transition(Send.Load, State.Loading),
	),
}, () => initialContext);

export const wrappedMachine = writable(createStateMachine({}));

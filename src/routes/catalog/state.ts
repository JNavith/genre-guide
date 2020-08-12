/*
	genre.guide - Catalog state management
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
	createMachine, invoke, state, transition, reduce,
} from "robot3";
import { writable } from "svelte/store";
import { call, FetchFunction } from "api";
import { Await, SerializableError, serializeError } from "utils";
import type { Track } from "../../graphql/object-types/Track";

const TRACK_FRAGMENT = `
	artist
	releaseDate
	id
	image
	name
	recordLabel
	source
	subgenresFlat {
		... on Subgenre {
			names
			textColor
			backgroundColor
		}
		... on Operator {
			symbol
		}
	}
`;

const GET_MOST_RECENT_TRACKS = `
	{
		tracks {
			${TRACK_FRAGMENT}
		}
	}
`;

const GET_TRACKS_BEFORE_ID = `
	query getTracks($beforeId: ID!) {
		tracks(before_id: $beforeId) {
			${TRACK_FRAGMENT}
		}
	}
`;

const loadTracks = async ({ fetch }: { fetch: FetchFunction }) => {
	const { data } = await call({ fetch, query: GET_MOST_RECENT_TRACKS });
	const tracks: TrackEntry[] = data?.tracks ?? [];

	tracks.forEach((track, loadIndex) => {
		// eslint-disable-next-line no-param-reassign
		track.loadIndex = loadIndex;
	});

	return tracks;
};

export interface TrackEntry extends Track {
	loadIndex: number;
}

interface Context {
	error: SerializableError ;
	tracks: TrackEntry[];
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
		transition(Send.Load, State.Loading,
			reduce((ctx: Partial<Context>, { fetch }: { fetch: FetchFunction }): Partial<Context> & Pick<Context, "fetch"> => ({ ...ctx, fetch }))),
	),

	[State.Loading]: invoke(
		loadTracks,
		transition("done", State.Loaded,
			reduce((ctx: Partial<Context>, { data }: { data: Await<ReturnType<typeof loadTracks>> }): Partial<Context> & Pick<Context, "tracks"> => ({ ...ctx, tracks: data, fetch: undefined }))),
		transition("error", State.Error,
			reduce((ctx: Partial<Context>, { error }: { error: Error }): Partial<Context> & Pick<Context, "error"> => ({ ...ctx, error: serializeError(error), fetch: undefined }))),
	),

	[State.Loaded]: state(
		transition(Send.Load, State.Loading,
			reduce((ctx: Partial<Context>, { fetch }: { fetch: FetchFunction }): Partial<Context> & Pick<Context, "fetch"> => ({ ...ctx, fetch }))),
	),

	[State.Error]: state(
		transition(Send.Load, State.Loading,
			reduce((ctx: Partial<Context>, { fetch }: { fetch: FetchFunction }): Partial<Context> & Pick<Context, "fetch"> => ({ ...ctx, fetch }))),
	),
}, () => initialContext);

export const wrappedMachine = writable(createStateMachine({ tracks: [] }));

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
import api, { FetchFunction } from "../../globals/api";
import { Await } from "../../globals/utils";

const TRACK_FRAGMENT = `
	artist
	date
	id
	image
	name
	recordLabel
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
	const { data } = await api({ fetch, query: GET_MOST_RECENT_TRACKS });
	const tracks: Track[] = data?.tracks ?? [];

	tracks.forEach((track, loadIndex) => {
		// eslint-disable-next-line no-param-reassign
		track.loadIndex = loadIndex;
	});

	return tracks;
};

// TODO: just import the object type?
interface Track {
	artist: string;
	date: string;
	id: string;
	image?: string;
	name: string;
	recordLabel: string;
	subgenresFlat: any;

	loadIndex: number;
}

interface Context {
	error: Error;
	tracks: Track[];
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
	Retry = "retry",
	SetFetch = "set_fetch",
}

export const createStateMachine = (initialContext: Partial<Context>, initialState?: State) => createMachine(initialState ?? State.Empty, {
	[State.Empty]: state(
		transition(Send.Load, State.Loading),
		transition(Send.SetFetch, State.Empty, reduce((ctx: Partial <Context>, { fetch }: { fetch: FetchFunction }) => ({ ...ctx, fetch }))),
	),
	// TODO use @beyonk/sapper-httpclient
	[State.Loading]: invoke(loadTracks,
		transition("done", State.Loaded,
			reduce((ctx: Partial<Context>, { data }: { data: Await<ReturnType<typeof loadTracks>> }): Partial<Context> & Pick<Context, "tracks"> => ({ ...ctx, tracks: data }))),
		transition("error", State.Error,
			reduce((ctx: Partial<Context>, { error }: { error: Error }): Partial<Context> & Pick<Context, "error"> => ({ ...ctx, error })))),
	[State.Loaded]: state(
		transition(Send.Load, State.Loading),
		transition(Send.SetFetch, State.Loaded, reduce((ctx: Partial<Context>, { fetch }: { fetch: FetchFunction }): Partial<Context> & Pick<Context, "fetch"> => ({ ...ctx, fetch }))),
	),
	[State.Error]: state(
		transition(Send.Retry, State.Loading),
	),
}, () => initialContext);

export default writable(createStateMachine({ tracks: [] }));

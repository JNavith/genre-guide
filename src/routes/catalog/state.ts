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

import nodeFetch from "node-fetch";
import {
	createMachine, invoke, state, transition, reduce,
} from "robot3";
import { writable } from "svelte/store";
import api, { FetchFunction } from "../../globals/api";
import svelteRobot from "../../globals/svelte-robot";
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

const loadTracks = async ({ fetch: fetch_ }: { fetch: FetchFunction }) => {
	const result = await api({ fetch: fetch_, query: GET_MOST_RECENT_TRACKS });
	const tracks: Track[] = result.data?.tracks;

	tracks.forEach((track, loadIndex) => {
		// eslint-disable-next-line no-param-reassign
		track.loadIndex = loadIndex;
	});

	return tracks;
};

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
}

export enum State {
	Empty = "empty",
	Error = "error",
	Loaded = "Loaded",
	Loading = "Loading",
}

export enum Send {
	Load = "load",
	Retry = "retry",
}

export const createStateMachine = (initialContext: Partial<Context>, initialState?: State) => svelteRobot(createMachine(initialState ?? State.Empty, {
	[State.Empty]: state(
		transition(Send.Load, State.Loading),
	),
	// TODO use @beyonk/sapper-httpclient
	// @ts-ignore
	[State.Loading]: invoke(() => loadTracks({ fetch: (process.browser ? fetch : nodeFetch) }),
		transition("done", State.Loaded,
			reduce((ctx: Partial<Context>, { data }: { data: Await<ReturnType<typeof loadTracks>> }) => ({ ...ctx, tracks: data }))),
		transition("error", "error",
			reduce((ctx: Partial<Context>, { error }: { error: Error }) => ({ ...ctx, error })))),
	[State.Loaded]: state(
		transition(Send.Load, State.Loading),
	),
	[State.Error]: state(
		transition(Send.Retry, State.Loading),
	),
}, () => initialContext));

export default writable(createStateMachine({ tracks: [] }));

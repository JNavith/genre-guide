/*
	genre.guide - Redis client TypeScript file
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


import Redis from "ioredis";

const {
	REDIS_HOST = "redis",
	REDIS_PORT = "6379",
	REDIS_PASSWORD,
} = process.env;

export const client = new Redis(
	parseInt(REDIS_PORT, 10),
	REDIS_HOST,
	{
		password: REDIS_PASSWORD,

		// This is so sad
		tls: {
			rejectUnauthorized: false,
		},
		
		maxRetriesPerRequest: 4,
	},
);

client.on("connect", async () => {
	console.log("successfully connected to redis");
});

client.on("error", async (error) => {
	if (error.errno === -3008) {
		console.error(`the given REDIS_HOST (${REDIS_HOST}) is unreachable (because it's probably invalid)`);
		await client.quit();
		return;
	}

	console.error(error);
});

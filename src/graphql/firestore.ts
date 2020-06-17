/*
	genre.guide - GraphQL server: Firestore client
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

import * as admin from "firebase-admin";

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
});

// Try not to directly use this if possible because it circumvents the cache below
export const db = admin.firestore();

export type Document = admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>;
const documentCache: Map<[string, string], Document> = new Map();

export type Collection = admin.firestore.QuerySnapshot<admin.firestore.DocumentData>;
const collectionCache: Map<string, Collection> = new Map();

export const getCollection = async (collection: string, cache = true): Promise<Collection> => {
	if (cache) {
		const cachedCollection = collectionCache.get(collection);
		if (cachedCollection) {
			console.log(`I found the collection ${collection} in the cache!!!`);
			return cachedCollection;
		}
	}

	const result = await db.collection(collection).get();
	// Add to the collection cache
	collectionCache.set(collection, result);
	// Add all documents to the document cache
	result.forEach((document: Document) => {
		documentCache.set([collection, document.ref.id], document);
	});

	return result;
};

export const getDocument = async (collection: string, document: string, cache = true): Promise<Document> => {
	const key: [string, string] = [collection, document];

	// Return the document from the cache if possible
	if (cache) {
		const cachedDocument = documentCache.get(key);
		if (cachedDocument) {
			console.log(`I found the document ${collection}.${document} in the cache!!!`);
			return cachedDocument;
		}
	}

	const docRef = db.collection(collection).doc(document);
	const result = await docRef.get();
	// Add the document to the document cache if it exists
	if (result.exists) {
		documentCache.set(key, result);
	}
	return result;
};

export const memoize = <Return, Func extends (...args: any[]) => Return>(fn: Func): Func => {
	const cache = new Map<any[], Return>();

	return ((...args: any[]) => {
		if (cache.has(args)) {
			return cache.get(args);
		}
		const result = fn(...args);
		cache.set(args, result);
		return result;
	}) as Func;
};

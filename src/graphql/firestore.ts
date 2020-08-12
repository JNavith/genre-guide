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

import { credential, firestore, initializeApp } from "firebase-admin";

initializeApp({
	credential: credential.applicationDefault(),
});

// Try not to directly use this if possible because it circumvents the cache below
export const db = firestore();

export type Document = firestore.DocumentSnapshot<firestore.DocumentData>;
const documentCache: Map<[string, string], Document> = new Map();

export type Collection = firestore.QuerySnapshot<firestore.DocumentData>;
const collectionCache: Map<string, Collection> = new Map();

export const getCollection = async (collection: string, cache = true): Promise<Collection> => {
	if (cache) {
		const cachedCollection = collectionCache.get(collection);
		if (cachedCollection) {
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

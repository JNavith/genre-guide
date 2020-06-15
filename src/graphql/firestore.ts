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
const documentCache: { [collectionAndID: string]: Document } = {};

export type Collection = admin.firestore.QuerySnapshot<admin.firestore.DocumentData>;
const collectionCache: { [collection: string]: Collection } = {};

export const getCollection = async (collection: string, cache = true): Promise<Collection> => {
	if (cache && Object.prototype.hasOwnProperty.call(collectionCache, collection)) {
		console.log(`I found the collection ${collection} in the cache!!!`);
		return collectionCache[collection];
	}

	const result = await db.collection(collection).get();
	// Add to the collection cache
	collectionCache[collection] = result;
	// Add all documents to the document cache
	result.forEach((document: Document) => {
		const key = [collection, document.ref.id];
		documentCache[JSON.stringify(key)] = document;
	});

	return result;
};

// eslint-disable-next-line max-len
export const getDocument = async (collection: string, document: string, cache = true): Promise<Document> => {
	const key = [collection, document];
	const keyString = JSON.stringify(key);

	// Return the document from the cache if possible
	if (cache && Object.prototype.hasOwnProperty.call(documentCache, keyString)) {
		console.log(`I found the document ${collection}.${document} in the cache!!!`);
		return documentCache[keyString];
	}

	const docRef = db.collection(collection).doc(document);
	const result = await docRef.get();
	// Add the document to the document cache if it exists
	if (result.exists) {
		documentCache[keyString] = result;
	}
	return result;
};

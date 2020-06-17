/*
	genre.guide - GraphQL server: Subgenre adapter
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

import { plainToClass } from "class-transformer";
import * as admin from "firebase-admin";
import {
	Document, getCollection, getDocument, db, memoize,
} from "../firestore";
import Subgenre from "../object-types/Subgenre";

const SUBGENRES_COLLECTION = "subgenres";

export const FirestoreToSubgenre = (documentData: admin.firestore.DocumentData): Subgenre => plainToClass(Subgenre, documentData);

// https://stackoverflow.com/a/49725198
type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
	Pick<T, Exclude<keyof T, Keys>>
	& {
		[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
	}[Keys]

interface SubgenreNameArgs {
	primaryName: string;
	anyName: string;
}

interface GetArgs {
	cache?: boolean;
}

const findSubgenre = (name: string) => db.collection(SUBGENRES_COLLECTION).where("names", "array-contains", name).limit(1).get();
const memoizedFindSubgenre = memoize(findSubgenre);

export const getOne = async ({ anyName, cache = true, primaryName }: GetArgs & RequireAtLeastOne<SubgenreNameArgs>): Promise<Subgenre> => {
	if (primaryName) {
		const document = await getDocument(SUBGENRES_COLLECTION, primaryName, cache);
		const documentData = document.data();
		if (documentData) {
			return FirestoreToSubgenre(documentData);
		}
		throw new TypeError(`the given subgenre ${primaryName} does not exist`);
	}
	if (!anyName) {
		throw new TypeError("no subgenre name was specified");
	}

	const querySnapshot = await (cache ? memoizedFindSubgenre : findSubgenre)(anyName);
	let document: Document | undefined;
	querySnapshot.forEach((document_) => { document = document_; });
	if (document) {
		const documentData = document.data();
		if (documentData) {
			return FirestoreToSubgenre(documentData);
		}
	}
	throw new TypeError(`the given subgenre ${anyName} does not exist`);
};

export const getAll = async ({ cache = true }: GetArgs = {}) => {
	const collection = await getCollection(SUBGENRES_COLLECTION, cache);

	const allSubgenres: Subgenre[] = [];

	collection.forEach((document: Document) => {
		const documentData = document.data();
		if (documentData) {
			const subgenre = FirestoreToSubgenre(documentData);
			allSubgenres.push(subgenre);
		}
	});

	return allSubgenres;
};

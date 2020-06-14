/*
	genre.guide - GraphQL server: Subgenre resolver
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
import { plainToClass } from "class-transformer";
import {
	FieldResolver, Query, Resolver, ResolverInterface, Root,
} from "type-graphql";

import { GraphQLError } from "graphql";
import { Document, getCollection, getDocument } from "../firestore";
import Subgenre from "../object-types/Subgenre";

export const SUBGENRES_COLLECTION = "subgenres";

export const FirestoreToSubgenre = (documentData: admin.firestore.DocumentData): Subgenre => plainToClass(Subgenre, documentData);

@Resolver(Subgenre)
export class SubgenreResolver implements ResolverInterface<Subgenre> {
	@Query((returns) => [Subgenre], { description: "Retrieve all subgenres from the sheet (database)" })
	async allSubgenres() {
		const subgenres = await getCollection(SUBGENRES_COLLECTION);
		const allSubgenres: Subgenre[] = [];

		subgenres.forEach((document: Document) => {
			const documentData = document.data();
			if (documentData) {
				const subgenre = FirestoreToSubgenre(documentData);
				allSubgenres.push(subgenre);
			}
		});

		return allSubgenres;
	}

	@Query((returns) => [Subgenre], { description: "Retrieve all categories (genres) from the sheet (database)" })
	async allCategories() {
		const subgenres = await getCollection(SUBGENRES_COLLECTION);
		const allCategories: Subgenre[] = [];

		subgenres.forEach((document: Document) => {
			const documentData = document.data();
			if (documentData?.category === document.ref.id) {
				const subgenre = FirestoreToSubgenre(documentData);
				allCategories.push(subgenre);
			}
		});

		return allCategories;
	}

	@FieldResolver()
	async categorySubgenre(@Root() subgenre: Subgenre) {
		const doc = await getDocument(SUBGENRES_COLLECTION, subgenre.category);
		const docData = doc.data();
		if (docData) {
			return FirestoreToSubgenre(docData);
		}
		throw new GraphQLError(`somehow there was no database entry for the ${subgenre.category} subgenre (${subgenre.names[0]}'s category) when it's expected to exist`);
	}

	@FieldResolver()
	parents(@Root() subgenre: Subgenre) {
		const originsPromises = subgenre.origins.map(async (origin) => {
			const originDoc = await getDocument(SUBGENRES_COLLECTION, origin);
			const originDocData = originDoc.data();
			if (originDocData) {
				return FirestoreToSubgenre(originDocData);
			}
			throw new GraphQLError(`somehow there was no database entry for the ${origin} subgenre (a parent of ${subgenre.names[0]}) when it's expected to exist`);
		});
		return Promise.all(originsPromises);
	}

	@FieldResolver()
	childrenSubgenres(@Root() subgenre: Subgenre): Promise<Subgenre[]> {
		console.log(`${subgenre.names} going to look up ${subgenre.children}`);
		const originsPromises = subgenre.children.map(async (child) => {
			console.log(`${subgenre.names[0]} going to look up ${child}`);
			const childDoc = await getDocument(SUBGENRES_COLLECTION, child);
			const childDocData = childDoc.data();
			if (childDocData) {
				return FirestoreToSubgenre(childDocData);
			}
			throw new GraphQLError(`somehow there was no database entry for the ${child} subgenre (a child of ${subgenre.names[0]}) when it's expected to exist`);
		});
		return Promise.all(originsPromises);
	}

	@FieldResolver()
	async description(@Root() subgenre: Subgenre) {
		// TODO: allow for descriptions to exist
		return undefined;
	}
}

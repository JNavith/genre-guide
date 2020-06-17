/*
	genre.guide - GraphQL server: Subgenre object type
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

import { Field, ObjectType } from "type-graphql";

@ObjectType({ description: "A subgenre, as understood on the Genre Sheet" })
export default class Subgenre {
    @Field((type) => [String], { description: "The primary name of the subgenre, e.x. \"Brostep\", followed by alternative names for the subgenre, e.x. {\"DnB\", \"D&B\"} for Drum & Bass" })
    names!: string[];

    category!: string;

    @Field((type) => Subgenre, { name: "category", description: "The genre category that this subgenre belongs to, which is where its color comes from, e.x. Vaporwave for Vaportrap, Future Bass for Future Bass" })
    categorySubgenre?: this;

    origins!: string[];

    @Field((type) => [Subgenre], { description: "The list of subgenres that this subgenre comes *directly* from, e.x. {Detroit Techno,} for Big Room Techno, {UK Hip Hop, 2-Step Garage} for Grime" })
    @Field((type) => [Subgenre], { name: "origins", description: "The list of subgenres that this subgenre comes *directly* from, e.x. {Detroit Techno,} for Big Room Techno, {UK Hip Hop, 2-Step Garage} for Grime", deprecationReason: "Use parents instead because it's a more specific name" })
	parents?: this[];

    children!: string[];

    @Field((type) => [Subgenre], { name: "children", description: "The list of subgenres that originate *directly* from this subgenre, e.x. {Deathstep, Drumstep} for Dubstep, {} for Footwork, {Electro Swing, Jazzstep} for Nu-Jazz" })
    childrenSubgenres?: this[];

    @Field((type) => String, { description: "The text color this subgenre uses on the Genre Sheet, in hex, e.x. '#000000' for Ambient" })
    textColor!: string;

    @Field((type) => String, { description: "The background color this subgenre uses on the Genre Sheet, in hex, e.x. '#009600' for Hardcore" })
    backgroundColor!: string;

    @Field((type) => String, { nullable: true, description: "A paragraph describing of this subgenre. Currently, no descriptions are available for any subgenre, so this always returns undefined" })
    description?: string;
}

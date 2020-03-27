/*
    genre.guide - Extra utitilies TypeScript file
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


export const groupBy = <ElementType, ResultType>(array: ElementType[], func: (arg0: ElementType) => ResultType): Map<ResultType, ElementType[]> => {
	const grouped = new Map<ResultType, ElementType[]>([]);

	array.forEach((value) => {
		const key = func(value);
		const groupItem = grouped.get(key);

		if (groupItem === undefined) grouped.set(key, [value]);
		else groupItem.push(value);
	});

	return grouped;
};

export const zip = <T1, T2>(array1: T1[], array2: T2[]): [T1, T2][] => array1.map((element, index) => [element, array2[index]]);

export const generatorMap = function*<ItemType, ResultType>(generator: Generator<ItemType>, func: (arg0: ItemType) => ResultType): Generator<ResultType> {
	for (let item of generator) {
		yield func(item);
	}
};

export const generatorFilter = function*<ItemType, ResultType>(generator: Generator<ItemType>, func: (arg0: ItemType) => ResultType): Generator<ItemType> {
	for (let item of generator) {
		if (func(item)) yield item;
	}
};

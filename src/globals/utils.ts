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

// https://stackoverflow.com/a/57364353
export type Await<T> = T extends {
	then(onfulfilled?: (value: infer U) => unknown): unknown;
} ? U : T;

export const generatorMap = function* <Item, Result>(generator: Generator<Item>, func: (arg0: Item) => Result): Generator<Result> {
	for (const item of generator) {
		yield func(item);
	}
};

export const generatorFilter = function* <Item, Result>(generator: Generator<Item>, func: (arg0: Item) => Result): Generator<Item> {
	for (const item of generator) {
		if (func(item)) yield item;
	}
};

export const groupBy = <Element, Result>(array: Element[], func: (arg0: Element) => Result): Map<Result, Element[]> => {
	const grouped = new Map<Result, Element[]>([]);

	array.forEach((value) => {
		const key = func(value);
		const groupItem = grouped.get(key);

		if (groupItem === undefined) grouped.set(key, [value]);
		else groupItem.push(value);
	});

	return grouped;
};


// TODO: doesn't actually work??? lol
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


export const zip = <T1, T2>(array1: T1[], array2: T2[]): [T1, T2][] => array1.map((element, index) => [element, array2[index]]);

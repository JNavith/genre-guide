import { interpret, Machine } from "robot3";
import { writable } from "svelte/store";

export default <S, C>(machine: Machine<S, C>) => {
	const { set: setState, ...state } = writable(machine.current);
	const { set: setContext, ...context } = writable((machine.context as any as () => C)());

	const { send } = interpret(machine, (service) => {
		setState(service.machine.current);
		setContext(service.context);
	});

	return { context, send, state };
};

export const setWait = (ms: number) => {
	return new Promise( resolve => setTimeout(resolve, ms) );
}
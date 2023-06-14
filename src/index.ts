import * as H from "./hypergraph";
// import {ExampleOne, ExampleTwo, ExampleThree, ExampleFour} from "./example";

export default H


function getGlobalObject() : any {
	if (typeof globalThis !== 'undefined') { return globalThis; }
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }

	throw new Error('Unable to locate global object.');
}

getGlobalObject().H = H;

// var selection = d3.select('#app-box').append('g')

// const res = ExampleOne.graphOne.show(selection, "horizontal")

// selection.attr('transform',`translate(0,${res[0] * 50}) rotate(-90)`)
// ExampleTwo.graphOne.show(d3.select('#app-box'))
// ExampleThree.graphOne.show(d3.select('#app-box'))
// ExampleFour.graphOne.show(d3.select('#app-box'))
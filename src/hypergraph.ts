import * as d3 from 'd3';
import * as d3_arrow from 'd3-arrow';


// mathjax stuff


export type NodeType = string;

export abstract class Node {

  label: NodeType;

  constructor(label: NodeType){
    this.label = label;
  }

}

export abstract class Edge {

  inNodes: Node[];
  oNodes: Node[];
  label: string | null;

  inHypergraphs: Hypergraph[] | null;

  constructor(inNodes : Node[], oNodes: Node[], label: string | null = null, inHypergraphs : Hypergraph[] | null = null) {
    
    this.inNodes = inNodes;
    this.oNodes = oNodes;
    this.label = label;
    this.inHypergraphs = inHypergraphs;
  }

}

class NodeWithId extends Node {
    
    id : number;
    
    constructor(label : NodeType, id : number) {
      super(label);
      this.id = id;
    }
  }

class EdgeWithId extends Edge {
    
    id : number;

    constructor(inNodes: Node[], oNodes: Node[], label : string | null = null, inEdges: Hypergraph[] | null = null, id : number) {
      
      super(inNodes, oNodes, label, inEdges);
      this.id = id;
    }

  }


export class Hypergraph{

    
  idCounter: number;

  graph: Edge[];
  
  // maps nodes to their edges
  inEdges: Map<number,Edge[]> = new Map(); //  edges e_i s.t. target(e_i) = node with id = id
  oEdges: Map<number,Edge[]> = new Map(); // edges e_i s.t. source(e_i) = node with id = id


  constructor(id : number = 0){
    
    this.graph = [];

    this.idCounter = id;
  }

  addNode(label: NodeType) : Node {

    var node : Node = new NodeWithId(label,this.idCounter);
    this.idCounter++;

    return node;
  }

  addPlainEdge(inNodes: Node[], oNodes: Node[], label: string) : Edge {

    var edge : Edge = new EdgeWithId(inNodes, oNodes, label, null, this.idCounter);
    this.graph.push(edge);

    this.idCounter++;


    inNodes.forEach(element => {
      
      var node = element as NodeWithId

      if (this.oEdges.has(node.id)) {
        this.oEdges.get(node.id)!.push(edge);        
      } else {
        this.oEdges.set(node.id, [edge]);
      }

    });

    oNodes.forEach(element => {
        
        var node = element as NodeWithId

        if (this.inEdges.has(node.id)) {
          this.inEdges.get(node.id)!.push(edge);        
        } else {
          this.inEdges.set(node.id, [edge]);
        }
    });

    return edge;
  }

  addHierarchicalEdge(inNodes: Node[], oNodes: Node[], inHypergraphs: Hypergraph[]) : Edge {

    var edge : Edge = new EdgeWithId(inNodes, oNodes, null, inHypergraphs, this.idCounter);

     this.graph.push(edge);

    this.idCounter++;


    inNodes.forEach(element => {
      
      var node = element as NodeWithId

      if (this.oEdges.has(node.id)) {
        this.oEdges.get(node.id)!.push(edge);        
      } else {
        this.oEdges.set(node.id, [edge]);
      }

    });

    oNodes.forEach(element => {
        
        var node = element as NodeWithId

        if (this.inEdges.has(node.id)) {
          this.inEdges.get(node.id)!.push(edge);        
        } else {
          this.inEdges.set(node.id, [edge]);
        }
    });

    return edge;
  }

  topSort() {

    var sortedEdges : Map<number,Map<number,Edge>> = new Map();

    var inputNodes : Node[] = [];
    
    // all nodes v such that there exists an edge : source(edge) = v 
    // and there is no edges e : target(e) = v

    this.graph.forEach(edge => {
        edge.inNodes.forEach(node => {

            if (!(this.inEdges.has((node as NodeWithId).id))) {
                inputNodes.push(node);
            }
        })
    });

    var frontierEdges: Map<number, Edge> = new Map();

    inputNodes.forEach(node => {

        var nodeWithId = node as NodeWithId

        if (this.oEdges.has(nodeWithId.id)) {
            this.oEdges.get(nodeWithId.id)!.forEach(edge => {
                
                var edgeId = (edge as EdgeWithId).id;
                const edgeInputs = edge.inNodes
                const isInputOutput = edgeInputs.reduce((prev : boolean, cur) => {
                    return prev || this.inEdges.has((cur as NodeWithId).id)
                }, false)
                
                if (!(frontierEdges.has(edgeId)) && !isInputOutput) {
                    frontierEdges.set(edgeId, edge);
                }
            })
        }
    })

    var level = 0;


    while(frontierEdges.size != 0) {
        
        sortedEdges.set(level,frontierEdges);
        inputNodes = [];

        frontierEdges.forEach(edge => {
            edge.oNodes.forEach(node => {
                inputNodes.push(node)
            })
        });

        frontierEdges = new Map();

        inputNodes.forEach(node => {
            
            var nodeWithId = node as NodeWithId
            
            if (this.oEdges.has(nodeWithId.id)) {
                this.oEdges.get(nodeWithId.id)!.forEach(edge => {
                    
                    var edgeId = (edge as EdgeWithId).id;
                    
                    if (!(frontierEdges.has(edgeId))) {
                        frontierEdges.set(edgeId, edge);
                    }
                })
            }
        })

        level++;


    }

    return sortedEdges;
  }

  show(selection : d3.Selection<SVGGElement, unknown,HTMLElement,null>,
       initialHorizontalOffset : number = 1,
       initialVerticalOffset : number = 10) : [number, number] {


    type entry = {id : string, position : [number, number], parent : [number,number] | null, visible : boolean};
    type positionOffset = {position : [number, number], horizontalOffset: number, verticalOffset: number}

    function mkBody(nodes : Node[],
                    nodesToLocation : Map<number, positionOffset>, 
                    array: entry[],
                    offset : number,
                    horizontalOffset : number,
                    verticalOffset : number,
                    width : number,
                    middle : number,
                    input: boolean) {
      
        const n = nodes.length;
        const step = width / n;
        const invisibleOffset = input ? 10 : -10;
        const connectionOffset = input ? 15 : -15;

        function* generateOddIndicies() {
            
                for (var i = 0; i < (n + 1) / 2; i++) {
                    if (i == 0) yield i;
                    else {
                        yield i;
                        yield -i;
                    }
                } 
        }

        function* generateEvenIndicies() {
            
            for (var i = 1; i < n/2 + 1; i++) {
                yield -i;
                yield i;
            }
        }

        if (n % 2 == 1) {
            for (const i of generateOddIndicies()) {

                
                var index : number = Math.floor((n - 1) / 2);

                if(nodesToLocation.has((nodes[index + i] as NodeWithId).id)) {
                    
                    var entry = nodesToLocation.get((nodes[index + i] as NodeWithId).id)!
                    var position : [number, number] = [entry.position[0] - (horizontalOffset - entry.horizontalOffset), entry.position[1] - (verticalOffset - entry.verticalOffset)]
                    var newEntry : entry = {id: nodes[index + i].label, position: position, parent: [middle + step * i, offset + invisibleOffset], visible: true}
                    array.push(newEntry)
                
                } else {
                    array.push({id : nodes[index + i].label, position: [middle + step * i,offset], parent: [middle + step * i, offset + invisibleOffset], visible: true});
                    nodesToLocation.set((nodes[index + i] as NodeWithId).id, {position: [middle,offset], horizontalOffset : horizontalOffset, verticalOffset : verticalOffset})
                }

                array.push({id : "v" + i, position: [middle + step * i,offset + invisibleOffset], parent : [middle, offset + invisibleOffset + connectionOffset], visible: false});


            }
        } else {

            for (const i of generateEvenIndicies()) {

                const index = i < 0 ? n / 2 + i : n / 2 + i - 1
                const middleEven = i < 0 ? middle - (step / 2) : middle + (step / 2);

                if(nodesToLocation.has((nodes[index] as NodeWithId).id)) {

                    var entry = nodesToLocation.get((nodes[index] as NodeWithId).id)!
                    var position : [number, number] = [entry.position[0] - (horizontalOffset - entry.horizontalOffset), entry.position[1] - (verticalOffset - entry.verticalOffset)]
                    var newEntry : entry = {id : nodes[index].label, position: position, parent: [middleEven + step * (i + (i < 0? 1 : -1)), offset + invisibleOffset], visible: true}   
                    array.push(newEntry)
                } else {
                    const position = middleEven + step * (i + (i < 0? 1 : -1));
                    const entry : entry = {id : nodes[index].label, position: [position,offset], parent: [position, offset + invisibleOffset], visible: true} 
                    array.push(entry);
                    nodesToLocation.set((nodes[index] as NodeWithId).id, {position : entry.position, horizontalOffset : horizontalOffset, verticalOffset : verticalOffset})
                }

                array.push({id : "v" + i, position: [middleEven + step * (i + (i < 0? 1 : -1)),offset + invisibleOffset], parent : [middle, offset + invisibleOffset + connectionOffset], visible: false});

            }
        }
        
        return array;
      }


    var sortedEdges = this.topSort();

    var nodesToLocation : Map<number, positionOffset> = new Map();

    var verticalOffset = initialVerticalOffset

    const heightPerLevel : number[] = []

    const widths : number[] = []

    sortedEdges.forEach((edges,level) => {

        var horizontalOffset = initialHorizontalOffset
        const heights : number[] = []
        
        edges.forEach(edge => {
            
            const inputs = edge.inNodes.length;
            const outputs = edge.oNodes.length;


            const width = Math.max(outputs, inputs) <= 3? 60 : 60 + (Math.max(outputs, inputs) - 3) * 15;

            const middle = Math.floor(width / 2);

            if(edge.label == null) {

                const horizontalOffsetOld = horizontalOffset + 10
                const verticalOffsetOld = verticalOffset + 40

                var edgeSelection = selection.append('g').attr('transform',`translate(${horizontalOffsetOld},${verticalOffsetOld})`)

                var hierarchicalBoxGroup = edgeSelection.append('g')

                var totalWidthAdjusted = 0
                var totalWidth = 0
                var maxHeight = 0


                //stores offset for each dashed line below
                const offsets : number[] = []

                var innerHorizontalOffset = 1
                var innerVerticalOffset = 10

                edge.inHypergraphs!.forEach((hypergraph, index) => {
                    
                    const widthHeight : [number, number] = hypergraph.show(hierarchicalBoxGroup,innerHorizontalOffset,innerVerticalOffset)
                    
                    innerHorizontalOffset += (widthHeight[0] <= 3? 60 : (widthHeight[0]) * 15 + 40)
                    offsets.push(innerHorizontalOffset)

                    maxHeight = Math.max(maxHeight, widthHeight[1])
                    totalWidthAdjusted += (widthHeight[0] <= 3? 60 : (widthHeight[0]) * 15 + 40)
                    totalWidth += widthHeight[0]

                })

                widths.push(totalWidth + 1)
                heights.push(maxHeight + 1)

                // this specifies horizontal distance between hierarchical boxes
                horizontalOffset = innerHorizontalOffset + 20 

                edge.inHypergraphs!.forEach((_, index) => {

                    if(index != edge.inHypergraphs!.length - 1) {

                        const dashedLineArray : entry[] = [{id : "dummyId",
                                                            position : [offsets[index] - 1, 40],
                                                            parent : [offsets[index] - 1, 120 * (maxHeight) + 40], 
                                                            visible : false}]
                        
                        var link = d3.linkVertical<any,any,entry>()
                                    .source(d => d.parent)
                                    .target(d => d.position);
                    
                        hierarchicalBoxGroup.selectAll("dummy")
                                            .data(dashedLineArray)
                                            .join("path")
                                            .attr("d", link)
                                            .attr("fill", "none")
                                            .attr("stroke", "black")
                                            .style("stroke-width", "2px")
                                            .style("stroke-dasharray", ("3, 3")) ;
                    }
                })



                const bodyInArray = mkBody(edge.inNodes,
                                           nodesToLocation,
                                           [],
                                           15,
                                           horizontalOffsetOld,
                                           verticalOffsetOld,
                                           width,
                                           totalWidthAdjusted / 2,
                                           true);

                const bodyOutArray = mkBody(edge.oNodes,
                                            nodesToLocation, 
                                            bodyInArray, 
                                            120 * (maxHeight) + 65, 
                                            horizontalOffsetOld, 
                                            verticalOffsetOld, 
                                            width, 
                                            totalWidthAdjusted / 2,
                                            false);

                hierarchicalBoxGroup.selectAll('dummy')
                        .data(bodyOutArray)
                        .join('circle')
                        .attr('cx', d => d.position[0])
                        .attr('cy', d => d.position[1])
                        .classed('circle', true)
                        .filter(d => d.visible == false)
                        .style('r', 0);

                hierarchicalBoxGroup.selectAll('dummy')
                        .data(bodyOutArray)
                        .join('text')
                        .attr('dx', d => d.position[0] + 4)
                        .attr('dy', d => d.position[1])
                        .filter(d => d.visible == true)
                        .text(d => d.id)

                hierarchicalBoxGroup.append('g')
                                    .append('rect')
                                    .attr('x',0)
                                    .attr('y',40)
                                    .attr('width',totalWidthAdjusted + 5)
                                    .attr('height',120 * maxHeight)
                                    .classed('rounded', true);

                var link = d3.linkVertical<any,any,entry>()
                             .source(d => d.parent)
                             .target(d => d.position);
                
                
                hierarchicalBoxGroup.selectAll("dummy")
                    .data(bodyOutArray)
                    .join("path")
                    .attr("d", link)
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .style("stroke-width", "1px");

            } else {

                var edgeSelection = selection.append('g').attr('transform',`translate(${horizontalOffset},${verticalOffset})`)

                const bodyGroup = edgeSelection.append('g');
                const labelGroup = edgeSelection.append('g');


                const bodyInArray = mkBody(edge.inNodes, nodesToLocation, [], 50, horizontalOffset, verticalOffset, width, middle, true);
                const bodyOutArray = mkBody(edge.oNodes, nodesToLocation, bodyInArray, 130, horizontalOffset, verticalOffset, width, middle, false);

                const tex1 = MathJax.tex2svg(edge.label!);
                const texNode = tex1.querySelector("svg");

                horizontalOffset += width;
                    
                labelGroup
                .append(() => texNode)
                .attr("x",middle - 8) //middle of the body box
                .attr("y",80) //middle of the body box
                .attr("width", 16)
                .attr("height",16)


                bodyGroup.selectAll('circle')
                        .data(bodyOutArray)
                        .join('circle')
                        .attr('cx', d => d.position[0])
                        .attr('cy', d => d.position[1])
                        .classed('circle', true)
                        .filter(d => d.visible == false)
                        .style('r', 0);
                
                bodyGroup.selectAll('text')
                        .data(bodyOutArray)
                        .join('text')
                        .attr('dx', d => d.position[0] + 4)
                        .attr('dy', d => d.position[1])
                        .filter(d => d.visible == true)
                        .text(d => d.id)

                // middle of rect should be in the width / 2
                const bodyWidth = 30;
                const bodyMiddle = Math.floor(width / 2) - bodyWidth / 2;

                bodyGroup.append('rect')
                        .attr('x',bodyMiddle)
                        .attr('y',75)
                        .attr('width',30)
                        .attr('height',30)
                        .classed('rounded', true);



                var link = d3.linkVertical<any,any,entry>()
                    .source(d => d.parent)
                    .target(d => d.position);


                bodyGroup
                .selectAll("path")
                .data(bodyOutArray)
                .join("path")
                .attr("d", link)
                .attr("fill", "none")
                .attr("stroke", "black")
                .style("stroke-width", "1px");

                heights.push(1)
            
            }
        })

        heightPerLevel.push(heights.reduce((prev,cur) => Math.max(prev,cur), - Infinity))
        verticalOffset += Math.max(heights.reduce((prev,cur) => Math.max(prev,cur * 120), -Infinity), 120)
            
    })

    sortedEdges.forEach((value, _) => {

        var totalWidth = 0

        value.forEach((edge,_) => {
            totalWidth += Math.max(edge.inNodes.length, edge.oNodes.length)
        })

        widths.push(Math.max(totalWidth,3 * value.size))
    })

    return [widths.reduce((a, b) => Math.max(a, b), -Infinity), heightPerLevel.reduce((a,b) => a+b, 0)]

  }
  
//   getNode(selection : d3.Selection<SVGGElement, unknown,HTMLElement,null>){
    
//     // -- input interface height : 20 --
//     // -- input interface arrow height : 30
//     // -- input interface wires
//     // -- body
//     // -- output interface wires
//     // -- output interface arrow
//     // -- output interface
//     const inGroup = selection.append('g');
//     const outGroup = selection.append('g');
//     const bodyGroup = selection.append('g');
//     const labelGroup = selection.append('g');
    
//     const middle = Math.floor(width / 2);
//     const totalHeight = 180;

//     type entry = {id : string, position : [number, number], parent : [number,number] | null, visible : boolean};

//     function mkInterface(n : number, array: entry[], offset : number, width : number) {
      
//       const step = width / n;
      
//       if(n % 2 == 1) {

//         for(var i = 0; i < (n + 1) / 2; i++) {
        
//           if(i == 0) {
//             array.push({id : "v" + i, position: [middle,offset], parent : null, visible: true});
//           } else {
//             array.push({id : "v" + i, position: [middle + step * i,offset], parent : null, visible: true});
//             array.push({id : "v" + i, position: [middle - step * i,offset], parent : null, visible: true});
//           }
//         }
//       } else {
//         const left = middle - step / 2;
//         const right = middle + step / 2;
//         for(var i = 0; i < n / 2; i++) {
        
//           if(i == 0) {
//             array.push({id : "v" + i, position: [middle + (step / 2),offset], parent : null, visible: true});
//             array.push({id : "v" + i, position: [middle - (step / 2),offset], parent : null, visible: true});
//           } else {
//             array.push({id : "v" + i, position: [right + (step * i),offset], parent : null, visible: true});
//             array.push({id : "v" + i, position: [left - (step * i),offset], parent : null, visible: true});
//           }
//         }
//       }
      
//       return array;
//     }

//     function mkBody(n : number, array: entry[], offset : number, width : number, input: boolean) {
      
//       const step = width / n;
//       const invisibleOffset = input ? 10 : -10;
//       const connectionOffset = input ? 15 : -15;
      
//       if(n % 2 == 1) {

//         for(var i = 0; i < (n + 1) / 2; i++) {
        
//           if(i == 0) {
//             array.push({id : "v" + i, position: [middle,offset], parent: [middle, offset + invisibleOffset], visible: true});
//             array.push({id : "v" + i, position: [middle,offset + invisibleOffset], parent : [middle, offset + invisibleOffset + connectionOffset], visible: false});
//           } else {
//             array.push({id : "v" + i, position: [middle + step * i,offset], parent : [middle + step * i, offset + invisibleOffset], visible: true});
//             array.push({id : "v" + i, position: [middle - step * i,offset], parent : [middle - step * i, offset + invisibleOffset], visible: true});

//             array.push({id : "v" + i, position: [middle + step * i,offset + invisibleOffset], parent : [middle, offset + invisibleOffset + connectionOffset], visible: false});
//             array.push({id : "v" + i, position: [middle - step * i,offset + invisibleOffset], parent : [middle, offset + invisibleOffset + connectionOffset], visible: false});
//           }
//         }
//       } else {
//         const left = middle - step / 2;
//         const right = middle + step / 2;

//         for(var i = 0; i < n / 2; i++) {
        
//           if(i == 0) {
//             array.push({id : "v" + i, position: [middle + (step / 2),offset], parent: [middle + (step / 2), offset + invisibleOffset], visible: true});
//             array.push({id : "v" + i, position: [middle - (step / 2),offset], parent: [middle - (step / 2), offset + invisibleOffset],visible: true});

//             array.push({id : "v" + i, position: [middle + (step / 2),offset + invisibleOffset], parent : [middle, offset + invisibleOffset + connectionOffset], visible: false});
//             array.push({id : "v" + i, position: [middle - (step / 2),offset + invisibleOffset], parent : [middle, offset + invisibleOffset + connectionOffset], visible: false});
//           } else {
//             array.push({id : "v" + i, position: [right + (step * i),offset], parent: [right + (step * i), offset + invisibleOffset] ,  visible: true});
//             array.push({id : "v" + i, position: [left - (step * i),offset], parent: [left - (step * i), offset + invisibleOffset], visible: true});

//             array.push({id : "v" + i, position: [right + (step * i),offset + invisibleOffset], parent : [middle, offset + invisibleOffset + connectionOffset], visible: false});
//             array.push({id : "v" + i, position: [left - (step * i),offset + invisibleOffset], parent : [middle, offset + invisibleOffset + connectionOffset], visible: false});
//           }
//         }
//       }
      
//       return array;
//     }

    

//     const inArray = mkInterface(this.inputs, [], 10, this.width);    
    
//     const outArray = mkInterface(this.outputs, [], 170, this.width);
        
//     const bodyInArray = mkBody(this.inputs,[], 50, this.width, true);
//     const bodyOutArray = mkBody(this.outputs, bodyInArray, 130, this.width, false);
    
//     // input interface box 
//     inGroup.append('rect')
//            .classed('interface',true)
//            .attr('x',0)
//            .attr('y',1)
//            .attr('width',this.width)
//            .attr('height', 20);

//     inGroup
//            .selectAll('circle')
//            .data(inArray)
//            .join('circle')
//            .attr("cx", d => d.position[0])
//            .attr("cy", d => d.position[1])
//            .classed("circle", true);

//     // output interface box 
//     outGroup.append('rect')
//             .classed('interface',true)
//             .attr('x',0)
//             .attr('y',160)
//             .attr('width',this.width)
//             .attr('height', 20);
    
//     outGroup.selectAll('circle')
//            .data(outArray)
//            .join('circle')
//            .attr("cx", d => d.position[0])
//            .attr("cy", d => d.position[1])
//            .classed("circle", true);

//     const label = `foo`;

//     const tex1 = MathJax.tex2svg(label);
//     const texNode = tex1.querySelector("svg");
        
//     labelGroup
//       .append(() => texNode)
//       .attr("x",middle - 8) //middle of the body box
//       .attr("y",80) //middle of the body box
//       .attr("width", 16)
//       .attr("height",16)


//     bodyGroup.selectAll('circle')
//              .data(bodyOutArray)
//              .join('circle')
//              .attr('cx', d => d.position[0])
//              .attr('cy', d => d.position[1])
//              .classed('circle', true)
//              .filter(d => d.visible == false)
//              .style('r', 0);

//     // middle of rect should be in the width / 2
//     const bodyWidth = 30;
//     const bodyMiddle = Math.floor(this.width / 2) - bodyWidth / 2;

//     bodyGroup.append('rect')
//              .attr('x',bodyMiddle)
//              .attr('y',75)
//              .attr('width',30)
//              .attr('height',30)
//              .classed('rounded', true);



//     var link = d3.linkVertical<any,any,entry>()
//         .source(d => d.parent)
//         .target(d => d.position);


//     bodyGroup
//       .selectAll("path")
//       .data(bodyOutArray)
//       .join("path")
//       .attr("d", link)
//       .attr("fill", "none")
//       .attr("stroke", "black")
//       .style("stroke-width", "1px");


//     const arrow = d3_arrow.arrow5()
//         .id("my-arrow")
//         .attr('class','arrow')
//         .scale(0.5);
    
//     inGroup.call(arrow);

//     inGroup.append("polyline")
//       .attr("marker-end", "url(#my-arrow)")
//       .attr("points", `${middle}, 24, ${middle}, 42`)
//       .attr("class", "arrow")
//       .attr("stroke-width", 1);

//     outGroup.call(arrow);

//     outGroup.append("polyline")
//         .attr("marker-end", "url(#my-arrow)")
//         .attr("points", `${middle}, ${totalHeight - 24}, ${middle}, ${totalHeight - 24 - 18}`)
//         .attr("class", "arrow")
//         .attr("stroke-width", 1);

    
  

//   }
  
  
}

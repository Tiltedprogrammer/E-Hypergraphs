import * as d3 from 'd3';
import { Hypergraph } from "./hypergraph";


export namespace ExampleOne {

    export const graphOne = new Hypergraph();

    var nodeA = graphOne.addNode("A");
    var nodeB = graphOne.addNode("B");
    var nodeC = graphOne.addNode("C");
    var nodeK = graphOne.addNode("K");
    var nodeL = graphOne.addNode("L");
    var nodeH = graphOne.addNode("H");

    const graphTwo = new Hypergraph();

    var nodeD = graphTwo.addNode("D");
    var nodeE = graphTwo.addNode("E");

    const graphThree = new Hypergraph();

    var nodeF = graphThree.addNode("F")
    var nodeG = graphThree.addNode("G")
    var nodeJ = graphThree.addNode("J")
    var nodeI = graphThree.addNode("I")

    graphTwo.addPlainEdge([nodeD],[nodeE],"g")

    graphThree.addPlainEdge([nodeF],[nodeG],"e")
    graphThree.addPlainEdge([nodeG],[nodeJ, nodeI],"h")

    const graphFour = new Hypergraph()

    var nodeM = graphFour.addNode("M")
    var nodeN = graphFour.addNode("N")

    graphFour.addPlainEdge([nodeM], [nodeN], "l")

    graphOne.addPlainEdge([nodeA, nodeB],[nodeC], "f");
    graphOne.addPlainEdge([nodeK],[nodeL], "o")

    graphOne.addHierarchicalEdge([nodeC],[nodeH], [graphTwo, graphThree])
    graphOne.addHierarchicalEdge([nodeL],[nodeH], [graphFour])


}

export namespace ExampleTwo{

    export const graphOne = new Hypergraph();
    
    const nodeA = graphOne.addNode('A');
    const nodeB = graphOne.addNode('B');
    
    const graphTwo = new Hypergraph();
    
    const nodeC = graphTwo.addNode('C')
    const nodeD = graphTwo.addNode('D')

    const graphThree = new Hypergraph()

    const nodeE = graphThree.addNode('E')
    const nodeF = graphThree.addNode('F')

    const graphFour = new Hypergraph()

    const nodeG = graphFour.addNode('G')
    const nodeH = graphFour.addNode('H')

    const graphFive = new Hypergraph()

    const nodeI = graphFive.addNode('I')
    const nodeJ = graphFive.addNode('J')

    graphThree.addPlainEdge([nodeE],[nodeF],'f')
    graphFour.addPlainEdge([nodeG],[nodeH],'g')
    graphFive.addPlainEdge([nodeI],[nodeJ],'e')

    graphTwo.addHierarchicalEdge([nodeC],[nodeD],[graphThree, graphFour])
    graphOne.addHierarchicalEdge([nodeA],[nodeB],[graphTwo,graphFive])


}


export namespace ExampleThree{

    export const graphOne = new Hypergraph();
    
    const nodeA = graphOne.addNode('A');
    const nodeB = graphOne.addNode('B');
    
    const graphTwo = new Hypergraph();
    
    const nodeC = graphTwo.addNode('C')
    const nodeD = graphTwo.addNode('D')
    const nodeD2 = graphTwo.addNode('D')

    const graphThree = new Hypergraph()

    const nodeE = graphThree.addNode('E')
    const nodeF = graphThree.addNode('F')

    const graphFour = new Hypergraph()

    const nodeG = graphFour.addNode('G')
    const nodeH = graphFour.addNode('H')

    const graphFive = new Hypergraph()

    const nodeI = graphFive.addNode('I')
    const nodeJ = graphFive.addNode('J')

    graphThree.addPlainEdge([nodeE],[nodeF],'f')
    graphFour.addPlainEdge([nodeG],[nodeH],'g')
    graphFive.addPlainEdge([nodeI],[nodeJ],'e')

    graphTwo.addHierarchicalEdge([nodeC],[nodeD],[graphThree, graphFour])
    graphTwo.addPlainEdge([nodeD],[nodeD2],"f'" )

    graphOne.addHierarchicalEdge([nodeA],[nodeB],[graphTwo,graphFive])

}

export namespace ExampleFour{

    export const graphOne = new Hypergraph()

    const nodeA = graphOne.addNode('A')
    const nodeB = graphOne.addNode('B')
    const nodeC = graphOne.addNode('C')

    const graphTwo = new Hypergraph()

    const nodeD = graphTwo.addNode('D')
    const nodeE = graphTwo.addNode('E')
    const nodeF = graphTwo.addNode('F')

    graphTwo.addPlainEdge([nodeD, nodeE], [nodeF], 'f')

    const graphThree = new Hypergraph()

    const nodeG = graphThree.addNode('G')
    const nodeH = graphThree.addNode('H')
    const nodeI = graphThree.addNode('I')

    graphThree.addHierarchicalEdge([nodeG,nodeH],[nodeI], [graphTwo])

    graphOne.addHierarchicalEdge([nodeA,nodeB],[nodeC],[graphThree])

}
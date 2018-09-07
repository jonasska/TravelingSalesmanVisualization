const PHEROMONE_UPDATE_RATE = 1;
const MIN_PHERO_LEVEL = 0.1;
const DEFAULT_PHERO_LEVEL = 1;
const ITERATIONS = 1000;
const ANTS = 20;
const q0 = 0.1;
const beta = 1;
const rho = 0.1;

var nodes=[];
var globalPhero =[];

var globalBestAnt;


function prepareOptProblem(){
    
    console.log("preparing new opt problem");
    nodes=[];
    globalPhero =[];
    for (var i=0;i<circles.length;i++)
    {
        
        var node = [];
        var nodephero = [];
        for (var j=0;j<circles.length;j++)
        {
            if(i==j)
                continue;
            var distance = Math.sqrt((circles[i].x - circles[j].x)*(circles[i].x - circles[j].x) + (circles[i].y - circles[j].y)*(circles[i].y - circles[j].y));
            var path = [j, distance]; // [destination node , distance(heuristic)]
            node.push(path);
            node.sort(comparePaths,1);
            nodephero.push(DEFAULT_PHERO_LEVEL);
        }
        //console.log(node);
        nodes.push(node);
        globalPhero.push(nodephero);
    }
    //console.log(nodes);

    if (nodes.length>=4){
        ACOsearch();
    }
    
}

function comparePaths(pa,pb){
    return pa[1]-pb[1];
}

function ACOsearch(){
    
    console.log("start ACO search");
    globalBestAnt = null;
    for (var iter =0;iter<ITERATIONS;iter++)
    {
        var localPhero = JSON.parse(JSON.stringify(globalPhero)); // deep copy 
        var localBestAnt = null;
        for (var a=0;a<ANTS;a++)
        {
            var ant = new Ant(localPhero);
            //console.log(JSON.stringify(localPhero));
            ant.buildTravelingPlan();
            //console.log(JSON.stringify(localPhero));

            if (localBestAnt == null){
                localBestAnt = ant;
            }
            else if(localBestAnt.fitness>ant.fitness){
                localBestAnt = ant;
            }
        }

        if (globalBestAnt == null){
            globalBestAnt = localBestAnt;
        }
        else if(globalBestAnt.fitness>localBestAnt.fitness){
            globalBestAnt = localBestAnt;
        }

        evaporateGlobalPheromone();
        updateGlobalPheromone(globalBestAnt);
        updateGlobalPheromone(localBestAnt);

    }
    console.log("finished ACO search");
    console.log("final fitness:", globalBestAnt.fitness," solution:",globalBestAnt.solution);
}

function updateGlobalPheromone(ant)
{
    for(var i=0;i<ant.solution.length-1;i++)
    {
        var current = ant.solution[i];
        var next = ant.solution[i+1];
        globalPhero[current][next] += (rho * PHEROMONE_UPDATE_RATE /*   *(q1/heuristic)   */);
        if (globalPhero[current][next]<MIN_PHERO_LEVEL)
        {
            globalPhero[current][next]=MIN_PHERO_LEVEL;
        }
    }
    var current = ant.solution[ant.solution.length-1];
    var next = ant.solution[0];
    globalPhero[current][next] += (rho * PHEROMONE_UPDATE_RATE /*   *(q1/heuristic)   */);
    if (globalPhero[current][next]<MIN_PHERO_LEVEL)
    {
        globalPhero[current][next]=MIN_PHERO_LEVEL;
    }

}

function evaporateGlobalPheromone()
{
    for(var i=0;i<globalPhero.length;i++){
        for(var j=0;j<globalPhero[i].length;j++)
        {
            globalPhero[i][j]*=(1-rho);
        }
    }
}

function Ant(phero){
    this.phero = phero;
    this.solution = [];
    this.fitness;

    this.buildTravelingPlan = function() {
        while (!this.isTourComplete()){

            if (this.solution.length==0){// add first random node to solution
                var n = Math.floor(Math.random() * nodes.length);
                this.solution.push(n);
            }
            var currentNode = this.solution[this.solution.length-1];
            var destinationIndex = this.findNextDestination(currentNode);
            if (destinationIndex!=-1)
            {
                this.addDestinationToSolution(currentNode,destinationIndex);
            }
            
        }
        //console.log(this.solution);
        this.evaluateSolution();
    }

    this.isTourComplete = function(){
        if (this.solution.length>=nodes.length)
            return true;

        return false;
    }

    this.findNextDestination = function(currentNode){
        if(Math.random()<q0){//find best
            var dest = this.findBestDestination(currentNode);
            return dest;
        }else{ //find stochastic
            var dest =  this.findStochasticDestination(currentNode);
            return dest;
        }
    }

    this.findBestDestination = function(currentNode){
        var bestStrength = 0;
        var bestDest = -1
        for (var d=0;d<nodes[currentNode].length;d++){
            var str = this.findDestinationStrength(currentNode,d);
            if (bestStrength < str)
            {
                bestStrength = str;
                bestDest = d;
            }
        }
        return bestDest;
    }
    this.findStochasticDestination = function(currentNode){
        var totalDestinationStrengths = 0;
        for (var d=0;d<nodes[currentNode].length;d++){
            var str = this.findDestinationStrength(currentNode,d);
            totalDestinationStrengths += str;
        }
        var rand = Math.random() * totalDestinationStrengths;
        var partSum = 0;
        for (var d=0;d<nodes[currentNode].length;d++){
            var str = this.findDestinationStrength(currentNode,d);
            partSum += str;
            if (partSum>rand)
            {
                return d;
            }
        }

        return -1;
    }

    this.findDestinationStrength = function(currentNode, dest){
        if (!this.destVisited(currentNode,dest))
        {
            var h = 1000/nodes[currentNode][dest][1];
            var p = phero[currentNode][dest];
            return p * Math.pow(h,beta);
        }
        return 0;
    }

    this.destVisited = function(currentNode,dest){
        for (var i =0; i<this.solution.length;i++)
        {
            if (this.solution[i] == nodes[currentNode][dest][0]){
                return true;
            }
            
        }
        return false;
    }

    this.addDestinationToSolution = function(currentNode, destination){
        this.solution.push(nodes[currentNode][destination][0]);
        // local pheromone update
        var p = this.phero[currentNode][destination];
        p = ((1 - rho) * p) + (rho * DEFAULT_PHERO_LEVEL);
        this.phero[currentNode][destination] = p;
    }

    this.evaluateSolution = function(){
        var fit = 0;
        //console.log("nodes",nodes);
        for(var i=0;i<this.solution.length-1;i++)
        {
            //console.log("from to",this.solution[i],this.solution[i+1]);
            var cnode = nodes[this.solution[i]];
            var l = -1;
            for (var j =0;j<cnode.length;j++)
            {
                if (cnode[j][0]==this.solution[i+1])
                {
                    l = nodes[this.solution[i]][j][1];
                }
            }

            if (l==-1)
                console.log("something wrong");
             
            fit +=l;
        }
        this.fitness = fit;
        //console.log("fitness",fit);
    }
}
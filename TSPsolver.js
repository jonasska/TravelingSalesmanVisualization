const INIT_PHERO_LEVEL = 1;
const ITERATIONS = 100;
const ANTS = 10;

var nodes=[];
var globalPhero =[];


function prepareOptProblem(){
    
    console.log("preparing new opt problem");
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
            nodephero.push(INIT_PHERO_LEVEL);
        }
        console.log(node);
        nodes.push(node);
        globalPhero.push(nodephero);
    }
}

function comparePaths(pa,pb){
    return pa[1]-pb[1];
}

function ACOsearch(){
 
}
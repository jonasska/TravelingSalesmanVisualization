var nodes=[];


function prepareOptProblem(){
    

    for (var i=0;i<circles.length;i++)
    {
        var node = [];
        for (var j=0;j<circles.length;j++)
        {
            if(i==j)
                continue;
            var distance = Math.sqrt((circles[i].x - circles[j].x)*(circles[i].x - circles[j].x) + (circles[i].y - circles[j].y)*(circles[i].y - circles[j].y));
            var path = [j,distance];
            node.push(path);
            node.sort(comparePaths,1);
        }
        nodes.push(node);
    }
}

function comparePaths(pa,pb){
    return pa[1]-pb[1];
}
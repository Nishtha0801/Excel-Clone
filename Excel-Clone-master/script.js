/*===================================IMPORT FILES===========================================*/                        
let $ = require("jquery");
let fs = require("fs");
let dialog = require("electron").remote.dialog;


/*===================================GLOBAL VARIABLES===========================================*/
let db = [];
let lsc;

/*===================================FILE MENU OPTIONS===========================================*/
$(".new").on("click", function(){
    db = [];
    let allrows = $(".cells .rows");
    for(let i = 0;i<allrows.length;i++){
        let rows = [];
        let allColsinRow = $(allrows[i]).find(".cell");
        for(let j=0;j<26;j++){
            let address = get_Address_from_rId_cId(i,j);
            let obj = {
                address : address,
                value : "",
                formula : "",
                child : [],
                parent : [],
                fontName : "arial",
                cellFormatting:{ bold:false , underline:false , italic:false },
                cellAlignment : "center",
                fontSize : "16px",
                textColor : "black",
                background : "white"
                };
            rows.push(obj);
            $(allColsinRow[j]).html("");
            $(allColsinRow[j]).css("font-family" , "arial");
            $(allColsinRow[j]).css("font-weight" , "normal");
            $(allColsinRow[j]).css("font-style" , "normal");
            $(allColsinRow[j]).css("text-decoration" ,"none");
            $(allColsinRow[j]).css("text-align" , "center");
            $(allColsinRow[j]).css("font-size" , "16px");
            $(allColsinRow[j]).css("color" , "black");
            // $(allColsinRow[j]).css("background-color" , "white");
        }
        db.push(rows);        
    }

    $(".addFormula, .address").val("");

});

$(".save").on("click", function(){
    let path = dialog.showSaveDialogSync();
    if(!path) return;
    let data = JSON.stringify(db);
    fs.writeFileSync(path,data);
    alert("file saved");
})

$(".open").on("click", function(){
    let path = dialog.showOpenDialogSync();
    if(!path) return;
    path = path[0];

    let data = fs.readFileSync(path);
    data = JSON.parse(data);
    db = data;

    let allrows = $(".cells .rows");
    for(let i=0;i<allrows.length;i++){
        let cell = $(allrows[i]).find(".cell");
        for(let j=0;j<cell.length;j++){
            let val = db[i][j].value;
            $(cell[j]).html(val);
            $(cell[j]).css("font-family" , `${db[i][j].fontName}`);
            $(cell[j]).css("font-weight" , db[i][j].cellFormatting.bold ? "bold" : "normal");
            $(cell[j]).css("font-style" , db[i][j].cellFormatting.italic ? "italic" : "normal");
            $(cell[j]).css("text-decoration" , db[i][j].cellFormatting.underline ? "underline" : "none");
            $(cell[j]).css("text-align" , `${db[i][j].cellAlignment}`);
            $(cell[j]).css("font-size" , `${db[i][j].fontSize}`);
            $(cell[j]).css("color" , `${db[i][j].textColor}`);
            $(cell[j]).css("background" , `${db[i][j].background}`);
        }        
    }
});

/*===================================HOME MENU OPTIONS===========================================*/

$("#bold").on("click", function(){
    let cellObj = getCellobj(lsc);
    $(lsc).css("font-weight", cellObj.cellFormatting.bold ? "normal" : "bold");
    cellObj.cellFormatting.bold = ! cellObj.cellFormatting.bold; 

})

$("#italic").on("click", function(){
    let cellObj = getCellobj(lsc);
    $(lsc).css("font-style", cellObj.cellFormatting.italic ? "normal" : "italic");
    cellObj.cellFormatting.italic = ! cellObj.cellFormatting.italic; 

})

$("#underline").on("click", function(){
    let cellObj = getCellobj(lsc);
    $(lsc).css("text-decoration", cellObj.cellFormatting.underline ? "none" : "underline");
    cellObj.cellFormatting.underline = ! cellObj.cellFormatting.underline; 

})

$("#fontcolor").on("click", function(){
    let cellObj = getCellobj(lsc);
    let value = $(this).val()
    $(lsc).css("color", value);
    cellObj.textColor = `${value}`; 

})

$("#cellcolor").on("click", function(){
    let cellObj = getCellobj(lsc);
    let value = $(this).val()
    $(lsc).css("background", value);
    cellObj.background = `${value}`; 

})

$(".alignment input").on("click", function(){
    let cellObj = getCellobj(lsc);
    let value = $(this).attr("class")
    $(lsc).css("text-align", value);
    cellObj.cellAlignment = `${value}`; 

})

$("#fontsize").on("click", function(){

    let cellObj = getCellobj(lsc);
    let value = $(this).val()
    $(lsc).css("font-size", `${value}px`);
    cellObj.fontSize = `${value}`; 

})

$("#font").on("click", function(){

    let cellObj = getCellobj(lsc);
    let value = $(this).val()
    $(lsc).css("font-family", value);
    cellObj.fontName = `${value}`; 

})

$(".file").on("click", function(){
    $(".homeOptions").removeClass("active");
    $(".fileOptions").addClass("active");

});

$(".home").on("click", function(){
    $(".fileOptions").removeClass("active");
    $(".homeOptions").addClass("active");

})

/*===================================SET HEIGHT==========================================*/
$(".cell").on("keyup", function(){
    setHeight(this);
})

function setHeight(elem){
    let height = $(elem).height();
    let rid = $(elem).attr("r-Id");
    let leftcol = $(".leftMostCell")[rid];
    $(leftcol).height(height);
}

/*===================================SET TOP MOST & LEFT MOST ===========================================*/

$(".content").on("scroll" , function(){
    let topOffset = $(this).scrollTop();
    let leftOffset = $(this).scrollLeft();
    $(".topMost , .topLeft").css("top" , topOffset+"px");
    $(".leftMost , .topLeft").css("left" , leftOffset+"px");
  })
  
/*===================================CELL CLICK===========================================*/
$(".cell").on("click",function(){
    let rid = Number($(this).attr("r-Id"));
    let cid = Number($(this).attr("c-Id"));
    let address = String.fromCharCode(65+cid) + (rid+1);
    $(".addressInput").val(address);

    let obj = getCellobj(this);
    $(".FormulaInput").val(obj.formula);
})

/*===================================CELL BLUR===========================================*/

$(".cell").on("blur", function(){
    lsc = this;
    let newVal = $(this).text();
    let obj = getCellobj(this);
    

    let NN_num = Number(newVal);
    if(newVal == ""){
        obj.value = "";
        obj.parent = [];
        obj.formula = "";
    }else if(!NN_num){           //when your cell have child but you put some string, then children cell will show error
        obj.value = newVal;
        if(obj.child.length>0){
            console.log("hi");
            for(let i=0;i<obj.child.length;i++){
                let {rowId , colId} = get_rId_cId_fromAddress(obj.child[i]);
                let childobj = db[rowId][colId];
                
                showErr(childobj);
            }
        }
    }else if(newVal!= obj.value){
        obj.value = newVal;
        if(obj.formula){
            removeFormula(obj);
            $(".FormulaInput").val("");
        }
        updateChildren(obj);
    }
console.log(db);
});

/*===================================FORMULA BLUR===========================================*/

$(".FormulaInput").on("blur", function(){
    let formula = $(this).val();
    let obj = getCellobj(lsc);
    if(obj.formula.length>0 && formula.length==0){
        $(lsc).text("");
        obj.formula = "";
        obj.value = "";
        removeFormula(obj)
        obj.child = [];
    }else if(obj.formula != formula){
    
        removeFormula(obj);

        if( addFormula(formula) ){
            updateChildren(obj);
        }
    }
})

/*===================================ADD FORMULA===========================================*/

function addFormula(formula){

    let obj = getCellobj(lsc);
    // A1
    let formulaArray = formula.split(" ");
    let children = obj.child;

    for(let i=0;i<children.length;i++){
        for(let j=0;j<formulaArray.length;j++){
            if(children[i]==formulaArray[j] || formulaArray[j]==obj.address){
                // alert("CYCLE DETECTED !!!!");
                console.log("cycle");
                return false;
            }
        }
    }

    for(let j=0;j<formulaArray.length;j++){
        if(formulaArray[j]==obj.address){
            // alert("CYCLE DETECTED !!!!");
            console.log("cycle");
            return false;
        }
    }

    obj.formula = formula;
    solveFormula(obj);
    return true;
}

/*===================================SOLVE FORMULA===========================================*/


function solveFormula(obj){
    let formula = obj.formula;
    let fcomps = formula.split(" ");

    for(let i=0;i<fcomps.length;i++){
        fcomp = fcomps[i];

        let initial = fcomp[0];

        if(initial>="A" && initial<="Z"){
            let {rowId, colId} = get_rId_cId_fromAddress(fcomp);
            let parentobj = db[rowId][colId];
            obj.parent.push(fcomp);
            parentobj.child.push(obj.address);
            let value = Number(parentobj.value);
            formula = formula.replace(fcomp,value);
        }
    }
    let value = eval(formula);
    obj.value = value;
    console.log(obj.value);
    let {rowId, colId} = get_rId_cId_fromAddress(obj.address);
    $(`.cell[r-Id= ${rowId}][c-Id=${colId}]`).text(value);

}

/*===================================UPDATE CHILDREN===========================================*/
function updateChildren(obj){
    let children = obj.child;
    for(let i=0;i<children.length;i++){
        let child = children[i];
        let {rowId, colId} = get_rId_cId_fromAddress(child);
        let childobj = db[rowId][colId];
        recalculate(childobj);
        updateChildren(childobj);
    }
}
/*===================================RECALCULATE===========================================*/

function recalculate(obj){
    let formula = obj.formula;
    let fcomps = formula.split(" ");

    for(let i=0;i<fcomps.length;i++){
        fcomp = fcomps[i];

        let initial = fcomp[0];

        if(initial>="A" && initial<="Z"){
            let {rowId, colId} = get_rId_cId_fromAddress(fcomp);
            let parentobj = db[rowId][colId];
            let value = Number(parentobj.value);
            formula = formula.replace(fcomp,value);
        }
    }
    let value = eval(formula);
    obj.value = value;
    console.log(obj.value);
    let {rowId, colId} = get_rId_cId_fromAddress(obj.address);
    $(`.cell[r-Id= ${rowId}][c-Id=${colId}]`).text(value);

}

/*===================================REMOVE FORMULA===========================================*/
function removeFormula(obj){
    obj.formula = "";

    for(let i=0;i<obj.parent.length;i++){
        let {rowId , colId} = get_rId_cId_fromAddress(obj.parent[i]);
        let parentobj = db[rowId][colId];

        let newParentChild =  parentobj.child.filter( function(child){
            return child != obj.address;
        });

        parentobj.child = newParentChild;

    }
    obj.parent = [];
}

/*===================================SHOW ERROR===========================================*/
function showErr(obj){

    let presentobj = get_rId_cId_fromAddress(obj.address);
    db[presentobj.rowId][presentobj.colId].value = "err";
    $(`.cell[r-Id=${presentobj.rowId}][c-Id=${presentobj.colId}]`).html("err");

    for(let i=0;i<obj.child.length;i++){
        let child = get_rId_cId_fromAddress(obj.child[i]);
        let childobj = db[child.rowId][child.colId];

        showErr(childobj);
    }


}

/*===================================GET CELL OBJ===========================================*/

function getCellobj(ele){
    let rid = Number($(ele).attr("r-Id"));
    let cid = Number($(ele).attr("c-Id"));
    return db[rid][cid]
}

/*===================================GET ID'S FROM ADDRESS===========================================*/
function get_rId_cId_fromAddress(address){
    let rId = Number(address.substring(1)) - 1;
    let cId = Number(address.charCodeAt(0) -65 )

    return { rowId : rId ,
             colId : cId
            };
}
/*===================================GET ADDRESS FROM ID'S===========================================*/
function get_Address_from_rId_cId(rId, cId){
    let rowId = rId + 1 ;
    let colId = String.fromCharCode(65 + cId);

    return `${colId}${rowId}`;
}

/*===================================FUNCTION RUN AT BOOT TIME===========================================*/
function init() {
    $(".new").trigger("click");
}
init();
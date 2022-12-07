document.getElementById("jsonfileinput").addEventListener("change", function() {
  var file_to_read = document.getElementById("jsonfileinput").files[0];
  var fileread = new FileReader();
  fileread.onload = function(e) {
    var content = e.target.result;
    var myvar = JSON.parse(content);
    //Extract useful metadata from the json
    datatype =   Object.keys(myvar)[0]
    metaDataVersionOID = myvar[datatype].metaDataVersionOID
    itemGroupDataKey=Object.keys(myvar[datatype].itemGroupData)[0]
    itemGroupData=myvar[datatype].itemGroupData[itemGroupDataKey]
    records =itemGroupData.records
    label =itemGroupData.label
    //create a variable holding the actual data
    dataset =itemGroupData.itemData
    //create an array holding the column metadata
    cols=itemGroupData.items
    //parse column metadata to check for any date variables which will need to be converted
    // create a list of date columns which can be used for date and datetime conversions
    datecols = []
    datetimecols = []

    for ( iter in cols) {
      if (   cols[iter].name.slice(-2) ==='DT') {
      datecols.push(iter)
      }
      else if (   cols[iter].name.slice(-3) ==='DTM') {
      datetimecols.push(iter)
      }

    }
    //convert legacy sas dates into iso format
    var date = new Date('1960-01-01'),
    d = date.getDate(),
    m = date.getMonth(),
    y = date.getFullYear();


    for ( iter in dataset) {
      for (vars in datecols){
        if (dataset[iter][ datecols[vars]  ] !== null ){
        dataset[iter][ datecols[vars]  ]   = new Date(y, m, d+ dataset[iter][ datecols[vars]  ] ).toISOString().split("T")[0]
      }
      } 

  }



    $("#headerp").text('Dataset: ' + itemGroupData.label + ", Data Type: " + datatype + ", Records: " + records);
    // Extract the column names and labels load these into an array which can be used to assign table header
    var arr =[]
    //create an array to hold the custom buttons
    var buttonarray =  []
    var toglist =""

    var i = 1;
    let objrownum = { };
    objrownum["title"] = "#"
    arr.push(objrownum)

//Create function which can be used to plot data
function myfuncnum(colnum,colname,coltype){

//  var coldata = dataset.map(function(value,index) { return value[colnum]; });
 var coldata =mytable.column( colnum, {order:'index', search:'applied'} ).data().toArray();

$('#exampleModalLabel').text(colname);
$('#exampleModal').modal("show");

    var trace1 = {
    x: coldata,
    type: 'histogram',
    }  ;

    var trace2 = {
    x: coldata,
    type: 'box',
  xaxis: 'x2',
  yaxis: 'y2',
  y2axis_title:""
    } 
    
    
    ;

var data = [trace1, trace2];

var layout = {
  grid: {rows: 1, columns: 2, pattern: 'independent'},
  width: 800,
  height: 600,
  showlegend: false,
};

Plotly.newPlot('mofig', data, layout);

var mystats = new Object();
mystats.n =coldata.length

mystats.mean = Math.round(10*d3.mean(coldata))/10;
mystats.median = Math.round(10*d3.median(coldata))/10;
mystats.minmax = Math.round(10*d3.min(coldata))/10 + "," + Math.round(10*d3.max(coldata))/10;
mystats.std = Math.round(100*d3.deviation(coldata))/100;

var statsum = "<ul > <li>n:  "+  mystats.n+ "<li>Mean:  "+  mystats.mean+ "</li> <li>Median: " +  mystats.median + " </li>  <li>Min, Max: "+  mystats.minmax + "</li>   <li>STD:  + " +   mystats.std + "</li></ul>";
//inset the generated html into the div
$('#mostat').html(statsum)

}


function myfuncchar(colnum,colname,coltype){

  $('#exampleModalLabel').text(colname);
  $('#exampleModal').modal("show");
  var coldata =mytable.column( colnum, {order:'index', search:'applied'} ).data().toArray();
  //get the frequency counts by group
  const occurrences = coldata.reduce(function (acc, curr) {
    return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc
  }, {});
  //get the denominator
  
  let denom = 0;
  for (const value of Object.values(occurrences)) {
    denom += value;
  };
  var statsum ="xx";

  var statsum = "<table class ='table table-striped  table-hover'><thead><th></th><th>n</th><th>%</th></thead><tbody>";
  xvals =  Object.keys(occurrences)
  yvals =  Object.values(occurrences) 
  for (i in xvals) {
    perc = 10*Math.round(1000* yvals[i] /denom)/100    ;
    statsum+="<tr><td>" + xvals[i] + "</td>"  + "<td>" + yvals[i]  + "</td> <td>" + perc + "</td></tr>" 

  }

  statsum+="</tbody></table>"
 
  console.log(statsum)
  $('#mostat').html(statsum) 
  var layout ={
    xaxis : {automargin:true}
  }

  var figdata = [
    {
      x: Object.keys(occurrences),
      y: Object.values(occurrences),
      type: 'bar'
    }
  ];
  Plotly.newPlot('mofig', figdata,layout);
  }

  //Create the visualisation button array 
  for(var i = 1; i < cols.length; i++){
    let obj = {};
    let buttonobj = {};
    let myvar = cols[i].name
    let mylabel = cols[i].label
    let myvaltype = cols[i].type
    
    let myvalnum = i
    obj["title"] = cols[i].name + " ("+mylabel + ")"
    //used for the visualisation buttons
    buttonobj["text"] =  myvar;
    if (myvaltype  != "string"){
      buttonobj["action"] = function ( e, dt, node, config ) {
                            myfuncnum(myvalnum,mylabel,myvaltype)}
      
    }
    else {
      buttonobj["action"] = function ( e, dt, node, config ) {
      myfuncchar(myvalnum,mylabel,myvaltype)}
    }
    //push values out to arrays
    arr.push(obj)
    buttonarray.push(buttonobj)
    }




    // destroy div containing the table if it exists
    //destroy the div containing the column list to hide and recreate it
    if (typeof mytable !== 'undefined') {
      $('#mydiv2').remove();
      $("#mydiv").append('<div id="mydiv2"><table id="mytable" class="display" width="100%"></table></div>');

    }

    //initialise the datatable
    mytable = $('#mytable').DataTable({
      data: dataset,
      columns: arr,
      lengthMenu: [
            [10, 25, 50, -1],
            [10, 25, 50, 'All'],
        ],    
      dom: 'Bfr tip',
      buttons: [
        'pageLength',
        'copyHtml5',
        'excelHtml5',
        'csvHtml5',
        'pdfHtml5',
        'colvis',
           {
            extend: 'collection',
            text: 'Explore',
            buttons: buttonarray,
            autoClose: true,
           }
       ]

    });
    };
    fileread.readAsText(file_to_read);




});

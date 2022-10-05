

document.getElementById("jsonfileinput").addEventListener("change", function() {
  var file_to_read = document.getElementById("jsonfileinput").files[0];
  var fileread = new FileReader();
  fileread.onload = function(e) {
    var content = e.target.result;
    var myvar = JSON.parse(content); 
    //Extract useful metadata from the json
    datatype =   Object.keys(myvar)[0]
    metaDataVersionOID = myvar[datatype].metaDataVersionOID
    itemGroupDataKey=	Object.keys(myvar[datatype].itemGroupData)[0]
    itemGroupData=myvar[datatype].itemGroupData[itemGroupDataKey]
    records =itemGroupData.records
    label =itemGroupData.label
    //create a variable holding the actual data
    dataset =itemGroupData.itemData
    //create an array holding the column metadata 
    cols=itemGroupData.items
    //parse column metadata to check for any date variables which will need to be converted
    //maybe this could be improved to instead use the define


//     let datevars  = cols.filter(function (e) {
//     return e.name.slice(-2) ==='DT';
// });
//     console.log(datevars)
    arrcols = []
    for ( iter in cols) {
      if (   cols[iter].name.slice(-2) ==='DT') {
      arrcols.push(iter)
      }
    }
    //convert legacy sas dates into iso format


    var date = new Date('1960-01-01'),
    d = date.getDate(),
    m = date.getMonth(),
    y = date.getFullYear();


   for ( iter in dataset) {
   	 for (vars in arrcols){
   	 	dataset[iter][ arrcols[vars]  ]   = new Date(y, m, d+ dataset[iter][ arrcols[vars]  ] ).toISOString().split("T")[0]

   	 }

   	 

    }



    $("#headerp").text('Dataset: ' + itemGroupData.label + " Records: " + records);
    // Extract the column names and labels load these into an array which can be used to assign table header
    var arr =[]
    var toglist =""

    var i = 1;
    let objrownum = { };
    objrownum["title"] = "#"
    arr.push(objrownum)
      $('#togglechild').empty();

    toglist="Toggle columns:"
  

    for(var i = 1; i < cols.length; i++){
      let obj = {};
      obj["title"] = cols[i].name + " ("+cols[i].label + ")" 
      arr.push(obj)
      toglist = toglist +  ' <a href="#" class="toggle-vis" data-column="' + i + '">'  +    cols[i].name  + '</a>' 
      }

    $("#togglechild").append(toglist)
    $('a.toggle-vis').on('click', function (e) {
        e.preventDefault();
 
        // Get the column API object
        var column = mytable.column($(this).attr('data-column'));
 
        // Toggle the visibility
        column.visible(!column.visible());
    });














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
    });
    };


  //  $('#mytable').DataTable( {
  //   columnDefs: [ {
  //     targets: 10,
  //     render: $.fn.dataTable.render.moment( 'X', 'Do MMM YY' )
  //   } ]
  // } );


  //  $('#mytable').DataTable( {
  //   columnDefs: [ {
  //     targets: 11,
  //     render: $.fn.dataTable.render.moment( 'X', 'Do MMM YY' )
  //   } ]
  // } );


  //  $('#mytable').DataTable( {
  //   columnDefs: [ {
  //     targets: 12,
  //     render: $.fn.dataTable.render.moment( 'X', 'Do MMM YY' )
  //   } ]
  // } );



    fileread.readAsText(file_to_read);




});

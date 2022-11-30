

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
    var toglist =""

    var i = 1;
    let objrownum = { };
    objrownum["title"] = "#"
    arr.push(objrownum)

  

    for(var i = 1; i < cols.length; i++){
      let obj = {};
      obj["title"] = cols[i].name + " ("+cols[i].label + ")" 
      arr.push(obj)
      }


    // destroy div containing the table if it exists 
    //destroy the div containing the column list to hide and recreate it
    if (typeof mytable !== 'undefined') {
      $('#mydiv2').remove();
      $("#mydiv").append('<div id="mydiv2"><table id="mytable" class="display" width="100%"></table></div>');

    }


    //setup custom button
    $.fn.dataTable.ext.buttons.visual = {
      text: 'Visualise',
      action: function ( e, dt, node, config ) {
          console.log("Helloe World!")
      }
  };


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
        'visual'
	      ]

    });
    };



    fileread.readAsText(file_to_read);




});

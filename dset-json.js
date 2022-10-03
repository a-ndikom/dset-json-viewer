


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
    dataset =itemGroupData.itemData
    //actual data is in cols
    cols=itemGroupData.items
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
      toglist = toglist +  '<a class="toggle-vis" data-column="' + i + '">'  +    cols[i].name  + '</a>-' 
      }
      console.log(toglist)
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
      $("#mydiv").append('<div id="mydiv2"><table id="example" class="display" width="100%"></table></div>');

    }
    //initialise the datatable 
    mytable = $('#example').DataTable({
      data: dataset,
      columns: arr,
    });
    };
    fileread.readAsText(file_to_read);




});

/**
 * Created by rich on 5/20/14.
 */
var item_JSON;
var theItem;
var enums;
var item = Backbone.Model.extend({
    initialize: function(){
        console.log('this model has been initialized');
    }
});

function getEnums(path){
    $.getJSON(path, function( data ){
        enums = data['itemEnums'];
    });
}

function fillItem(path){
    var anItem;
    $.getJSON(path, function( data ){
        item_JSON = data;
        anItem = data['result'];
    }).complete(function(){
        theItem = new item(anItem);
        buildForm(theItem)
    });
}

function buildForm(theItem){
    var item = theItem.get('item');
    addTitle(item);
    addDescription(item);
    addNote(item);
    addMaterial(item, enums.material);
    addCondition(item, enums.condition.description);
    addSizes(item, enums.measurement);
    addMeasurements(item, enums.measurement);
}

function addSizes(item, style){
    var measurements = item.measurement;
    var selectedType;
    for(type in style.unit){
        if(type === measurements.unit){
            selectedType = type;
        }
    }
    var labels = ['Length','Depth','Height','Diameter'];
    var $size = $('.size');
    for(var i = 0; i < labels.length; i++){
        var $input = $('<input>');
        $input.attr('type','text');
        $input.attr('class','disabled form-control');
        $input.attr('name',labels[i].toLowerCase());
        if(measurements[labels[i].toLowerCase()]){
            $input.attr('value', measurements[labels[i].toLowerCase()]);
        }
        $size.append($input);
        var $label = $('<p>');
        var $unitType = $('<p>');
        $unitType.html(selectedType + '.');
        $label.html(labels[i] + ':');
        $input.before($label);
        $input.after($unitType);
        $input.change(function(){
            var label = $input.attr('name');
            item.measurement.label = $input.val();
            theItem.set({'item':item});
        });
    }

}

function addMeasurements(item, option){
    var measurements = item.measurement;
    var $unit = $('.unit');
    var $unitString = $('<p>');
    $unitString.html('Measurements are in: ');
    $unit.append($unitString);
    for(unit in option.unit){
        var $input = $('<input>');
        $input.attr('type','radio');
        $input.attr('value', unit);
        $input.attr('name','units');
        if(unit === measurements.unit){
            $input.attr('checked','true');
        }
        $unit.append($input);
        $input.after(' ' + option.unit[unit] + '(' + unit + ') ');
    }
    $unit.change(function(){
        item.measurement.unit = $('.unit input:checked').val();
        theItem.set({'item':item});
    });

    var $shape = $('.shape');
    var $shapeString = $('<p>');
    $shapeString.html('Measured Item is: ');
    $shape.append($shapeString);
    for(var i = 0; i < option.shape.length; i++){
        var $input = $('<input>');
        $input.attr('type','radio');
        $input.attr('value',option.shape[i]);
        $input.attr('name','shape');
        if(option.shape[i] === measurements.shape){
            $input.attr('checked','true');
        } else{
            $('.disabled').attr('disabled','true');
            $shape.change(function(){
                $('.disabled').removeAttr('disabled');
            });
        }
        $shape.append($input);
        $input.after(' ' + option.shape[i] + ' ');
    }
    $shape.change(function(){
        item.measurement.shape = $('.shape input:checked').val();
        theItem.set({'item':item});
    });

}

function addCondition(item, option){
    var condition = item.condition;
    var description = condition.description;
    var $radioGroup = $('.conditionRadio')
    for(var i = 0; i < option.length; i++){
        var $input = $('<input>');
        $input.attr('type','radio');
        $input.attr('value',option[i]);
        $input.attr('name','condition')
        if(option[i] === description){
            $input.attr('checked','true');
        }
        $radioGroup.append($input);
        $input.after(' ' + option[i] + ' ');
    }
    $radioGroup.change(function(){
        item.condition.description = $('.conditionRadio input:checked').val();
        theItem.set({'item':item});
    });
}

function addMaterial(item , option){
    var material = item.material;
    var type = material.description;
    var restricted = material.restricted;
    var $select = $('<select>');
    $select.attr('class','form-control');
    for(var i = 0; i < option.length; i++){
        var $option = $('<option>');
        $option.attr('value',option[i]);
        $option.html(option[i]);
        if(option[i] === type)
           $option.attr('selected','true');
        $select.append($option);
    }
    var $material = $('.material');
    $material.before($select);
    $select.change(function(){
        item.material.description = $('select option:selected').val();
        theItem.set({'item':item});
    });

    var $restrict = $('<input>');
    $restrict.attr('type','checkbox');
    if(restricted === 'Y'){
        $restrict.attr('checked', 'true');
    }
    $restrict.change(function(){
        var isRestricted = $restrict.is(':checked') ? 'Y' : 'N';
        item.material.restricted = isRestricted;
        theItem.set({'item':item});
    });

    var $info = $('<p>');
    $info.html('<strong>Check this box</strong> if the listing contains or may contain restricted materials');
    $material.append($restrict);
    $material.append($info);
}

function addTitle(item){
    var title = item['title'];
    var $title = $('<input>');
    $title.attr('type','text');
    $title.attr('class','form-control');
    if(typeof title === 'string'){
        $title.attr('value',title);
    }
    $title.change(function(){
        item.title = $title.val();
        theItem.set({'item':item});
    });
    $('#titleArea').after($title);
}

function addDescription(item){
    var description = item.description;
    var $description = $('<textarea>');
    $description.attr('class','form-control');
    if(typeof description === 'string'){
        $description.html(description);
    }
    $description.change(function(){
        item.description = $description.val();
        theItem.set({'item':item});
    });
    $('#descriptionArea').after($description);
}

function addNote(item) {
    var note = item.dealerInternalNotes;
    var $note = $('<textarea>');
    $note.attr('class','form-control');
    if(typeof note === 'string'){
        $note.html(note);
    }
    $note.change(function(){
        item.dealerInternalNotes = $note.val();
        theItem.set({'item':item});
    });
        $('#noteArea').after($note);
}

function printJSON(){
    console.log(JSON.stringify(theItem));
}

$(document).ready(
    function(){
        getEnums('enums.json');
        fillItem('item.json');
        $('.saved').click(
            printJSON
        );
    }
);
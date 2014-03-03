/**
 * sailsjscrudui
 *
 * @module      :: sailsjscrudui
 * @description :: Automatically creates user interface for data entry
 * @docs    :: http://sailsjs.org/#!documentation/models
 */

(function(){


  if(!String.prototype.trim) {
    String.prototype.trim = function () {
      return this.replace(/^\s+|\s+$/g,'');
    };
  }

  Boolean.prototype.crudRender = function(){
    if (this.toString() === "true"){
      return "YES" ;
    } else {
      return "NO" ;
    }
  };

  String.prototype.crudRender = function(){
    return this ;
  };

  String.prototype.toDateFromLocale = function(){
    var dateElements = this.split('/') ;
    var outputDateElements = [] ;
    //var locale = NodeCWInterfaceUtils.getCurrentLocale() ;
    var locale = {} ;
    locale.dateFormat = "d/m/y" ;
    var dateFormatPositions = locale.dateFormat.split('/') ;
    
    var dateFormatElements = {
      y: 0,
      m: 0,
      d: 0
    };

    for (var element in dateFormatElements){
      var dateFormatElementPosition = module.exports.findStringInArray(element,dateFormatPositions) ;
      outputDateElements.push(dateElements[dateFormatElementPosition]) ;
    }
    return new Date(outputDateElements) ;
  };

  Number.prototype.crudRender = function(){
    return this.formatNumber() ;
  };

  Number.prototype.formatMoney = function(c, d, t){
    var n = this,
      c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? "." : d,
      t = t == undefined ? "," : t,
      s = n < 0 ? "-" : "",
      i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
      j = (j = i.length) > 3 ? j % 3 : 0;
     return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
   };

  Number.prototype.formatNumber = function(c, d, t){
    var n = this,
      c = isNaN(c = Math.abs(c)) ? 2 : c,
      d = d == undefined ? "," : d,
      t = t == undefined ? "." : t,
      s = n < 0 ? "-" : "",
      i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
      j = (j = i.length) > 3 ? j % 3 : 0;
     return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
  };

  Date.prototype.crudRender = function(){
    return this.formatDate() ;
  };

  Date.prototype.formatDate = function(){
    var outputDateElements = [] ;
    var locale = NodeCWInterfaceUtils.getCurrentLocale() ;
    var dateFormatPositions = locale.dateFormat.split('/') ;
    for (var i=0;i<dateFormatPositions.length;i++){
      if (dateFormatPositions[i] == 'd'){
        outputDateElements.push(this.getDate()) ;
      }
      if (dateFormatPositions[i] == 'm'){
        outputDateElements.push(this.getMonth()+1) ;
      }
      if (dateFormatPositions[i] == 'y'){
        outputDateElements.push(this.getFullYear()) ;
      }
    }
    return outputDateElements.join('/') ;
  };
})();


/*
  Use init to initialize the controller with standard methods:
  - index   (lists all object in model)
  - new     (shows the view to create a new object in model)
  - edit    (shows the view to edit an existing object in model)
  - show    (shows an identified object in model)

  Example: if you have a model called "Project", these methods will be called with urls:
  - index:  /project
  - new:    /project/new
  - edit:   /project/edit/<objectid>
  - show:   /project/show/<objectid>

*/
module.exports.init = function(controller,fromPath){
  this.fromPath = fromPath ;

  return {
    index : function(req,res,next){
      module.exports.searchView(req,res,next,controller,{},function(viewConfig){
        res.view(viewConfig);
      });
    },

    'new' : function(req,res,next){
      module.exports.createView(req,res,next,controller,function(viewConfig){
        res.view(viewConfig);
      });
    },

    edit : function(req, res, next) {
      module.exports.updateView(req,res,next,controller,function(viewConfig){
        res.view(viewConfig);
      });
    },

    show : function(req, res, next) {
      module.exports.readView(req,res,next,controller,function(viewConfig){
        res.view(viewConfig);
      });
    },

    createAction : function(req, res, next) {
      module.exports.createAction(req,res,next,controller);
    },

    updateAction : function(req, res, next) {
      module.exports.updateAction(req,res,next,controller) ;
    },

    destroyAction : function(req, res, next) {
      module.exports.destroyAction(req,res,next,controller) ;
    },

    subscribe : function(req, res) {
      module.exports.subscribe(req,res,controller) ;
    },

    compare : function(req,res,next){
      module.exports.searchView(req,res,next,controller,{},function(viewConfig){
        res.view(viewConfig);
      });
    },


  } ;
} ;


module.exports.addUrlToBreadCrumbs = function(req,text,url){
  if (!req.session.breadCrumbs) req.session.breadCrumbs = [] ;
  for (var i=0;i<req.session.breadCrumbs.length;i++){
    var breadCrumb = req.session.breadCrumbs[i] ;
    if (breadCrumb.url === url){
      req.session.breadCrumbs.splice(i,1) ;
      break ;
    }
  }
  req.session.breadCrumbs.push({text:text,url:url}) ;
  if (req.session.breadCrumbs.length > 5) req.session.breadCrumbs.splice(0,1) ;
} ;

module.exports.removeUrlFromBreadCrumbs = function(req,url){
  if (!req.session.breadCrumbs) req.session.breadCrumbs = [] ;
  for (var i=0;i<req.session.breadCrumbs.length;i++){
    var breadCrumb = req.session.breadCrumbs[i] ;
    if (breadCrumb.url === url){
      req.session.breadCrumbs.splice(i,1) ;
      break ;
    }
  }
} ;


/*
  This method is called during runtime to obtain the configuration of the view for each crud operation
  If the controller name is "ProjectController.js" it loads the configuration from the companion file: "ProjectCrudConfig.js"
  The configuration file contains a JSON object describing:
  - the list of fields for each crud operation (mandatory)
  - the layout of fields in the crud operations
*/

module.exports.loadConfig = function(controller){
  var filepath = this.fromPath +"/" + controller.exports.globalId + "CrudConfig.js" ;
  var fs = require('fs') ;
  if (fs.existsSync(filepath)){
    var fromFileString = fs.readFileSync(filepath) ;
    var dataString = fromFileString.toString().replace(/(?:\/\*(?:[\s\S]*?)\*\/)|(?:([\s;])+\/\/(?:.*)$)/gm, '$1');
    if (dataString){
      var config = JSON.parse(dataString) ;
      if (config) _.extend(controller.exports,config);
    }
  }
};

module.exports.autoLayout = function(controller,viewType){
  /*

  layout: [
    {
      section: "Document", rows: [
        {PO:2,DocumentType:3,Description:6,Code:1},
        {Language:2,LastReview:2,PageFormat:4,General:4}
      ]
    }

  */
  if (!controller.exports.layout) {
    controller.exports.layout = [
        {
          section: "", rows: []
        }
      ] ;

      for (var i=0;i<controller.exports.fieldsConfig.length;i++){
        var field = controller.exports.fieldsConfig[i] ;
        var ines = field.ines ;
        if (ines.indexOf(viewType) > -1){
          var control = {} ;
          control[field.name] = 12;
          controller.exports.layout[0].rows.push(control) ;
        }
      }
  }
  
  var outputLayout = [] ;
  for (var i=0;i<controller.exports.layout.length;i++){
    var section = controller.exports.layout[i].section ;
    var rows = controller.exports.layout[i].rows ;
    var newRows = [] ;
    for (var r=0;r<rows.length;r++){
      var row = rows[r] ;
      var newRow = {} ;
      var fieldCount = 0 ;
      for (var f=0;f<controller.exports.fieldsConfig.length;f++){
        var field = controller.exports.fieldsConfig[f] ;
        if (row[field.name]){
          if (field.ines.indexOf(viewType) > -1){
            newRow[field.name] = row[field.name] ;
            fieldCount++ ;
          }
        }
      }
      if (fieldCount){
        newRows.push(newRow) ;
      }
    }
    if (newRows.length > 0){
      outputLayout.push({section:section, rows: newRows, config:controller.exports.layout[i]}) ;
    }
  }

  return outputLayout ;
};

module.exports.createView = function(req,res,next,controller,callback){

  this.loadConfig(controller) ;

  var layout = module.exports.autoLayout(controller,"n") ;
  var returnUrl = req.param('returnUrl') ;
  var name = controller.exports.identity ;
  var fields = controller.exports.fieldsConfig ;

  var newObj = {} ;
  for (var i=0;i<fields.length;i++){
    var fieldName = fields[i].name ;
    if (fields[i].ines.indexOf('n') > -1) newObj[fieldName] = req.param(fieldName) ;
  }

	var viewConfig = {
        fields: fields,
        fieldlayout: layout,
        controller: name,
        prettyName: controller.exports.prettyName,
        record : newObj,
        returnUrl: returnUrl
  } ;

  NodeCWInterfaceUtils.addConfigurationToViewConfig(req,res,viewConfig);
  
  var relationships = [] ;
  for (var i=0;i<viewConfig.fields.length;i++){
    var field = viewConfig.fields[i] ;
    if (field.type == 'checkbox'){
       field.checked = false ;
    }
    if (field.relationship){
      relationships.push(field) ;
    }
  }

  async.each(relationships,module.exports.compileOptionsForRelationships,function(err){
    callback(viewConfig);
  });
},

module.exports.AddRelatedRecords = function(fields,req,next){
  
  function addRelatedRecord(field,cb){
    newObj = {} ;
    newObj[field.relationship.inname] = req.param(field.name) ;
    sails.models[field.relationship.entity].create(newObj, function(err,newCreatedObj){
      addedObjectIds[field.relationship.requestField] = newCreatedObj.id ;
      cb(err);
    });
  }
  
  selectAddFields = [] ;
  for (var i=0;i<fields.length;i++){
    field = fields[i] ;
    if (field.type == "select-add"){
      selectAddFields.push(field);
    }
  }

  addedObjectIds = {} ;


  async.each(
    selectAddFields,
    addRelatedRecord,
    function(err){
      next(err,addedObjectIds) ;
    }
  ) ;

}

module.exports.createAction = function(req,res,next,controller){
  this.loadConfig(controller) ;
  var name = controller.exports.identity ;
  var fields = controller.exports.fieldsConfig ;
  this.AddRelatedRecords(fields,req,function(err,addedObjectIds){
      
      if (err) {
        console.log(err);
        req.session.flash = {
          err: err
        };
        if (returnUrl != "undefined") return res.redirect(returnUrl) ;
        return res.redirect('/'+ name + '/new/');
      }

      var returnUrl = req.param('returnUrl') ;
      var newObj = {} ;
      for (var i=0;i<fields.length;i++){
        var field = fields[i] ;
        var fieldName = field.name ;
        if (field.type == 'checkbox'){
          var checkedValue = field.checkedValue === undefined ? true : field.checkedValue ;
          var uncheckedValue = field.uncheckedValue === undefined ? false : field.uncheckedValue ;
          if (req.param(fieldName) === undefined){
            newObj[fieldName] = uncheckedValue ;
          } else {
            newObj[fieldName] = checkedValue ;
          }
        } else {
          var value = req.param(fieldName) ;
          if (value !== undefined) {
            if (field.type == 'date'){
              if (req.param(fieldName).toDateFromLocale){
                var date = req.param(fieldName).toDateFromLocale() ;
                if (date.toString() !== "Invalid Date") newObj[fieldName] = date ;
              }
            } else {
              newObj[fieldName] = req.param(fieldName) ;
            }
          }
        }
/*
        if (fields[i].ines.indexOf('n') > -1){
          if (fields[i].type == 'date'){
            if (req.param(fieldName).toDateFromLocale){
              var date = req.param(fieldName).toDateFromLocale() ;
              if (date.toString() !== "Invalid Date") newObj[fieldName] = date ;
            }
          } else {
            newObj[fieldName] = req.param(fieldName) ;
          }
        } 
*/
      }
      if (req.session.User){
        if (!newObj.creator) newObj.creator = req.session.User.id ;
      }

      for (var fieldNameInAddedObjectIds in addedObjectIds){
        newObj[fieldNameInAddedObjectIds] = addedObjectIds[fieldNameInAddedObjectIds] ;
      }
      
      sails.models[name].create(newObj, function (err, newCreatedObj) {
          if (err) {
            console.log(err);
            req.session.flash = {
              err: err
            };
            if (returnUrl != "undefined") return res.redirect(returnUrl) ;
            return res.redirect('/'+ name + '/new/');
          } else {
            sails.models[name].publishCreate(newCreatedObj.toJSON());
            if (returnUrl != "undefined") return res.redirect(returnUrl) ;
            res.redirect('/'+ name + '/show/' + newCreatedObj.id);
          }
      });
  }) ;
},

module.exports.addCustomFacet = function(viewConfig,caption,field,values,selectedvalue){
  viewConfig.facets.push({
    config : {field:field, caption: caption} ,
    values : values,
    selectedvalue : selectedvalue
  }) ;
},

module.exports.searchView = function(req, res, next, controller, filter, callback) {
    this.loadConfig(controller) ;


    function populateCompare(viewConfig){
      viewConfig.compareConfig = controller.exports.compareConfig ? controller.exports.compareConfig : {} ;
    }

    function populateFacets(viewConfig){
      var facets = [] ;
      viewConfig.facets = facets ;
      
      if (!controller.exports.facets) return ;

      for (var i=0;i<controller.exports.facets.length;i++){
        var facet = controller.exports.facets[i] ;
        facets.push({field:facet.field, values:{},config: facet, selectedvalue: req.param(facet.field)}) ;
      }

      for (var i=0;i<viewConfig.records.length;i++){
        var record = viewConfig.records[i] ;
        for (var f=0;f<facets.length;f++){
          var facet = facets[f] ;
          var value = record[facet.field] ;
          if (record[facet.field+"_id"] !== undefined){
              value = record[facet.field+"_id"] ;
          }
          var option = record[facet.config.option] ;
          if (value === undefined) value = "(null)" ;
          if (value === "") value = "(blank)" ;
          if (option === "") option = "(blank)" ;
          if (value === null) value = "(null)";
          if (option === null) option = "(null)" ;
          if (!facet.values[value]){
            facet.values[value] = {value: value, option: option, count:1 };
          } else {
            facet.values[value].count++ ;
          }
        }
      }

      
    }

    function makeFilter(){
      if (controller.exports.facets){
        for (var i=0;i<controller.exports.facets.length;i++){
          var field = controller.exports.facets[i].field ;
          var fielddefined = (req.param(field) !== '') && (req.param(field) != 'undefined') && (req.param(field) !== undefined) ;
          if (fielddefined){
            if (!filter.where) filter['where'] = {} ;
            var attribute = sails.models[controller.exports.identity]._attributes[field] ;
            var isString = false ;
            var isBoolean = false ;
            if (attribute){
              if (attribute.type){
                isString = (attribute.type === 'string') ;
                isBoolean = (attribute.type === 'boolean') ;
              } else {
                isString = (attribute === 'string') ;
                isBoolean = (attribute === 'boolean') ;
              }
            } else {
              if (!isBoolean) isString = isNaN(parseFloat(req.param(field))) ;
            }
            if (isString){
              filter.where[field] = req.param(field) ;
            } else if (isBoolean){
              var boolValue = req.param(field) === 'true' ;
              filter.where[field] = boolValue ;
            } else {
              filter.where[field] = parseFloat(req.param(field)) ;
            }
            
            if (filter.where[field] == '(blank)') filter.where[field] = '' ;
            if (filter.where[field] == '(null)') filter.where[field] = null ;

            sails.log.debug(filter) ;
          }
        }
      }
    }

    function removeDuplicateIds(viewConfig){
      if (!controller.exports.distinctFieldName) return ;
      var presentIds = {} ;
      var util = require('util') ;
      var distinctFieldName = controller.exports.distinctFieldName ;
      for (var rr = viewConfig.records.length-1;rr>=0;rr--){
        var record = viewConfig.records[rr] ;
        var rId = record[distinctFieldName] ;
        if (presentIds[rId]){
          viewConfig.records.splice(rr,1) ;
        } else {
          presentIds[rId] = true ;
        }
      }
    }

    function cutRecordToViewLimit(viewConfig){
      if (req.param('__viewlimit') === 'all'){
        viewConfig.recordcount = viewConfig.records.length ;
        viewConfig.pagecount = 1 ;
        viewConfig.viewpage = 1 ;
        viewConfig.viewlimit = viewlimit ;
        return ;
      }


      var viewpage = 1 ;
      var viewlimit = 100 ;

      if (req.param('__viewlimit') > 0){
        viewlimit = req.param('__viewlimit')*1 ;
      }
      if (req.param('__viewpage') > 0){
        viewpage = req.param('__viewpage')*1 ;
      }

      viewConfig.recordcount = viewConfig.records.length ;
      viewConfig.pagecount = Math.ceil(viewConfig.records.length/viewlimit) ;
      viewConfig.viewpage = viewpage ;
      viewConfig.viewlimit = viewlimit ;

      if (viewlimit == 'all') return ;


      if (viewConfig.records.length > viewlimit){
        var offset = (viewlimit*(viewpage -1)) ;
        var limitRecords = [] ;
        for (var i=offset;i<(viewlimit + offset);i++){
          limitRecords.push(viewConfig.records[i]) ;
        }
        viewConfig.records = limitRecords ;
      }
    }

    function calcRankForText(text,record){
      var rank = 0 ;
      for (var i=0;i<controller.exports.textSearchFields.length;i++){
        var field = controller.exports.textSearchFields[i] ;
        var value = record[field] ;
        if (value){
          if (value.toString().toLowerCase().indexOf(text.toLowerCase()) > -1) rank++ ;
        }
      }
      return rank/controller.exports.textSearchFields.length ;
    }

    function freeTextSearch(viewConfig){
      
      viewConfig.freetext = "" ;

      if (!controller.exports.textSearchFields) {
        controller.exports.textSearchFields = [] ;
        for (var i=0;i<controller.exports.fieldsConfig.length;i++){
          var field = controller.exports.fieldsConfig[i] ;
          if (field.name == "name") {
            controller.exports.textSearchFields.push("name") ;
          } else if (field.inname) {
            controller.exports.textSearchFields.push(field.name) ;
          }
        }
      }

      var fielddefined = (req.param('__freetext') !== "") && (req.param('__freetext') != "undefined") && (req.param('__freetext') !== undefined) ;
      if (!fielddefined) return ;

      var text = req.param('__freetext') ;
      var outputrecords = [] ;
      for (var i=0;i<viewConfig.records.length;i++){
        var record = viewConfig.records[i] ;
        var rank = calcRankForText(text,record) ;
        if (rank > 0){
          outputrecords.push(record) ;
        }
      }
      viewConfig.freetext = text ;
      viewConfig.records = outputrecords ;
    }

    var name = controller.exports.identity ;
    //module.exports.addUrlToBreadCrumbs(req, "List of " + name, "/" + name) ;

    makeFilter();

    sails.models[name].find(filter).exec(function(err, foundRecords) {
      if (err) return next(err);
      var viewConfig = {
        fields: controller.exports.fieldsConfig,
        controller: name,
        prettyName: controller.exports.prettyName,
        records : foundRecords
      } ;

      freeTextSearch(viewConfig) ;

      NodeCWInterfaceUtils.addConfigurationToViewConfig(req,res,viewConfig);

      var relationships = [] ;
      for (var i=0;i<viewConfig.fields.length;i++){
        var field = viewConfig.fields[i] ;
        if (field.relationship){
          relationships.push(field) ;
        }
      }

      function populateRelationshipsOnRecord(record,populateCallBack){
        
        function populateThisRelationshipOnRecord(field,populateThisCallBack){
          var relationship = field.relationship ;
          var relatedRecordId = record[field.name] ;
          var relatedEntity = relationship.entity ;
          if (!relatedRecordId) return populateThisCallBack();
          sails.models[relatedEntity].findOne(relatedRecordId,function(err,foundRecord){
            if (err){
              populateThisCallBack(err) ;
            } else {
              record[field.name+"_id"] = record[field.name] ;
              if (foundRecord){
                record[field.name] = relationship.inname ? foundRecord[relationship.inname] : foundRecord.inName() ;
              } else {
                record[field.name] = null ;
              }
              populateThisCallBack() ;
            }
          });
        }
        
        async.each(relationships,populateThisRelationshipOnRecord,function(err){
          populateCallBack() ;
        });
      }

      async.each(foundRecords,populateRelationshipsOnRecord,function(err){
        populateCompare(viewConfig);
        populateFacets(viewConfig);
        removeDuplicateIds(viewConfig);
        cutRecordToViewLimit(viewConfig) ;
        callback(viewConfig);
      });

    });
},

module.exports.readView = function(req,res,next,controller,callback){

  this.loadConfig(controller) ;

  var layout = module.exports.autoLayout(controller,"s") ;

  var name = controller.exports.identity ;

	sails.models[name].findOne(req.param('id'),function(err,foundRecord){
		if (err) next(err) ;
    var inname = name ;
    if (!foundRecord) return res.send(404);
    if (foundRecord.name) inname = foundRecord.name ;
    module.exports.addUrlToBreadCrumbs(req, inname, "/" + name + "/show/" + req.param('id')) ;
		var viewConfig = {
        fields: controller.exports.fieldsConfig,
        fieldlayout: layout,
        controller: name,
        prettyName: controller.exports.prettyName,
        record : foundRecord
    } ;


		NodeCWInterfaceUtils.addConfigurationToViewConfig(req,res,viewConfig);

    var relationships = [] ;
    var buttongroupsrelationships = [] ;
    var details = [] ;
    for (var i=0;i<viewConfig.fields.length;i++){
      var field = viewConfig.fields[i] ;
      if (field.type == 'checkbox'){
        var checkedValue = field.checkedValue === undefined ? true : field.checkedValue ;
        var uncheckedValue = field.uncheckedValue === undefined ? false : field.uncheckedValue ;
        field.checked = (foundRecord[field.name] == checkedValue) ;
      }
      if ((field.type != 'buttongroup') && field.relationship){
        relationships.push({
          entity:field.relationship.entity,
          attribute : field.name
        }) ;
      }
      if ((field.type == 'buttongroup') && field.relationship){
        buttongroupsrelationships.push(field) ;
      }
      if (field.type == "detail"){
        details.push(field) ;
      }
    }

    function compileRelationshipOnRecord(relationship, record, callback){
      var recordId = record[relationship.attribute] ;
      sails.models[relationship.entity].findOne({id:recordId},function(err,foundRecord){
        if (err) return callback(err) ;
        record[relationship.attribute] = foundRecord ;
        callback() ;
      });
    }

    function compileRelationshipOnRecordWithInName(relationship, record, callback){
      var recordId = record[relationship.attribute] ;
      sails.models[relationship.entity].findOne({id:recordId},function(err,foundRecord){
        if (err) return callback(err) ;
        record[relationship.attribute] = foundRecord.name ? foundRecord.name : foundRecord.inName() ;
        callback() ;
      });
    }

    function compileDetails(detailConfig,callback){
      /*
      {"name": "activeCountries", "ines":"nes", "type":"detail", "model":"country","key":"agent", "fields":[
        {"name":"name","label":"Country"},
        {"name":"areamanager", "label":"Area manager"}
      ]}
      */

      

      var filter = {} ;
      filter[detailConfig.key] = foundRecord.id ;
      var relationships = [] ;
      var attributes = sails.models[detailConfig.model]._attributes ;
      for (var attrname in attributes){
        var attribute = attributes[attrname] ;
        if (attribute.model){
          relationships.push({
            attribute : attrname,
            entity: attribute.model
          }) ;
        }
      }
      sails.models[detailConfig.model].find(filter,function(err,foundRecords){
        detailConfig.records = foundRecords ;
        if (err) return callback(err) ;
        if (foundRecords.length === 0) return callback() ;
        async.each(foundRecords,function(detailfoundRecord,detailFoundCallback){
          async.each(
            relationships,
            function(relationship,callback){
              compileRelationshipOnRecord(relationship,detailfoundRecord,callback);
            },
            function(err){
              detailFoundCallback(err);
            }
          );
        },function(err){
          callback(err) ;
        });
      });
    }


    async.parallel({
        relationships: function(rcallback){
          async.each(
            relationships,
            function(relationship,callback){
              compileRelationshipOnRecord(relationship,foundRecord,callback);
            },
            function(err){
              rcallback(err);
            }
          );
        },
        buttonGroups: function(bgcallback){
          async.each(buttongroupsrelationships,module.exports.compileOptionsForRelationships,function(err){
            bgcallback(err);
          });
        },
        details: function(fcallback){
          async.each(details,compileDetails,function(err){
            fcallback(err);
          });
        },
        attachments: function(acallback){
          module.exports.attachedFilesList(name, req.param('id'), viewConfig, function(err){
            acallback(err);
          });
        }
    },
    function(err, results) {
        callback(viewConfig);
    });

	});
},

module.exports.updateView = function(req,res,next,controller,callback){

  this.loadConfig(controller) ;

  var layout = module.exports.autoLayout(controller,"e") ;
  var returnUrl = req.param('returnUrl') ;
  var name = controller.exports.identity ;
	sails.models[name].findOne(req.param('id'),function(err,foundRecord){
		if (err) next(err) ;
		var viewConfig = {
          fields: controller.exports.fieldsConfig,
          fieldlayout: layout,
          controller: name,
          prettyName: controller.exports.prettyName,
          record : foundRecord,
          returnUrl: returnUrl
    } ;
    NodeCWInterfaceUtils.addConfigurationToViewConfig(req,res,viewConfig);
    var relationships = [] ;
    for (var i=0;i<viewConfig.fields.length;i++){
      var field = viewConfig.fields[i] ;
      if (field.type == 'checkbox'){
        var checkedValue = field.checkedValue === undefined ? true : field.checkedValue ;
        var uncheckedValue = field.uncheckedValue === undefined ? false : field.uncheckedValue ;
        field.checked = (foundRecord[field.name] == checkedValue) ;
      }
      if (field.relationship){
        relationships.push(field) ;
      }
    }

    async.each(relationships,module.exports.compileOptionsForRelationships,function(err){
      callback(viewConfig);
    });
	});
},

module.exports.updateAction = function(req,res,next,controller){

  this.loadConfig(controller) ;
  var returnUrl = req.param('returnUrl') ;
  var name = controller.exports.identity ;
  var fields = controller.exports.fieldsConfig ;
  var updateObj = {id:req.param('id')} ;
  for (var i=0;i<fields.length;i++){
    var field = fields[i] ;
    var fieldName = field.name ;
    if (field.ines.indexOf('e') > -1){

      if (field.type == 'checkbox'){
        var checkedValue = field.checkedValue === undefined ? true : field.checkedValue ;
        var uncheckedValue = field.uncheckedValue === undefined ? false : field.uncheckedValue ;
        if (req.param(fieldName) === undefined){
          updateObj[fieldName] = uncheckedValue ;
        } else {
          updateObj[fieldName] = checkedValue ;
        }
      } else {
        var value = req.param(fieldName) ;
        if (value !== undefined) {
          if (field.type == 'date'){
            if (req.param(fieldName).toDateFromLocale){
              var date = req.param(fieldName).toDateFromLocale() ;
              if (date.toString() !== "Invalid Date") updateObj[fieldName] = date ;
            }
          } else {
            updateObj[fieldName] = req.param(fieldName) ;
          }
        }
      }
    }
  }
  if (req.session.User){
    if (!updateObj.updator) updateObj.updator = req.session.User.id ;
  }
  sails.models[name].update({id:req.param('id')},updateObj, function (err, updatedObjs) {
    if (err) {
      console.log(err);
      req.session.flash = {
        err: err
      };
      if (returnUrl != "undefined") return res.redirect(returnUrl) ;
      res.redirect('/'+ name + '/show/' + req.param('id'));
    } else {
      sails.models[name].publishUpdate(req.param('id'),updatedObjs[0].toJSON());
      if (returnUrl != "undefined") return res.redirect(returnUrl) ;
      res.redirect('/'+ name + '/show/' + req.param('id'));
    }
  });
},

module.exports.destroyAction = function(req,res,next,controller){

  this.loadConfig(controller) ;

  var returnUrl = req.param('returnUrl') ;
  var method = req.param('method') ;
  var name ;

  if (method == "detach"){
    name = req.param('model') ;
    var key = req.param('key') ;
    var updateObj = {} ;
    updateObj[key] = null ;
    sails.models[name].update(req.param('id'),updateObj,function(err,updatedObjs){
      if (err) return next(err);
      res.redirect(req.param('returnUrl')) ;
    });
  } else {
    name = controller.exports.identity ;
    module.exports.removeUrlFromBreadCrumbs(req, "/" + name + "/show/" + req.param('id')) ;
    sails.models[name].findOne(req.param('id'), function (err, objectToDelete) {
        if (err) return next(err);
        if (!objectToDelete) return next(controller.exports.prettyname + ' doesn\'t exist.');
        var inname ;
        sails.models[name].destroy(req.param('id'), function (err) {
            if (err) return next(err);
            if (typeof(objectToDelete.inName) == 'function'){
              inname = objectToDelete.inName() ;
            } else {
              var fields = controller.exports.fieldsConfig ;
              var innamevalues = [] ;
              for (var i=0;i<fields.length;i++){
                var field = fields[i] ;
                if (field.inname) innamevalues.push(objectToDelete[field.name]) ;
              }
              inname = innamevalues.join(' ') ;
            }
            sails.models[name].publishUpdate(req.param('id'), {
              name: inname,
              action: ' has been destroyed.'
            });
            sails.models[name].publishDestroy(req.param('id'));
        });
        if (returnUrl !== undefined) return res.redirect(returnUrl) ;
        res.redirect('/' + name);
    });
  }


},

module.exports.subscribe = function(req, res, controller) {
  var name = controller.exports.identity ;
  sails.models[name].find(function (err, objects) {
    if (err) return next(err);
    sails.models[name].subscribe(req.socket);
    sails.models[name].subscribe(req.socket, objects);
    res.send(200);
  });
},


module.exports.compileOptionsForRelationships = function(field,relationshipcallback){

  function compare(a,b) {
    if (a.text < b.text)
       return -1;
    if (a.text > b.text)
      return 1;
    return 0;
  }

  var relationship = field.relationship ;
  sails.models[relationship.entity]
    .find()
    .exec(function(err,foundRecords){
      if (err){
        relationshipcallback(err) ;
        return;
      }
      var options = [] ;
      for (var i=0;i<foundRecords.length;i++){
        var option = {
          id: foundRecords[i].id,
          text : relationship.inname ? foundRecords[i][relationship.inname] : foundRecords[i].inName()
        };
        options.push(option);
      }

      options.sort(compare) ;

      field.options = options ;
      relationshipcallback() ;
    });
},


module.exports.compileFileDisposition = function(controller){

},

module.exports.exportCSV = function(data,fieldSeparator,fieldList){
  /*
    data: json
    fieldSeparator : "c" = "," , "s" = ";", "t" = "\t" ;
  */
  var fieldSeparatorDefined = (fieldSeparator !== "") && (fieldSeparator != "undefined") && (fieldSeparator !== undefined) ;
  fieldSeparator = fieldSeparatorDefined ? fieldSeparator : "s" ;
  if (fieldSeparator == "c") fieldSeparator = "," ;
  if (fieldSeparator == "s") fieldSeparator = ";" ;
  if (fieldSeparator == "t") fieldSeparator = "\t" ;
  var rowSeparator = "\n" ;
  if (data.length === 0) return ;
  var output = [] ;
  var fields = [] ;
  for (var i=0;i<data.length;i++){
    var row = data[i].toJSON() ;
    var outputrow = [] ;
    if (i===0){
      if (fieldList){
        for (var ff=0;ff<fieldList.length;ff++){
          var field = fieldList[ff] ;
          outputrow.push(field) ;
          fields.push(field) ;
        }
      } else {
        for (var field in row){
          //if (field.indexOf(fieldSeparator) > -1) field = '"' + field + '"' ;
          outputrow.push(field) ;
          fields.push(field) ;
        }        
      }

    } else {
      for (var f=0;f<fields.length;f++){
        var fieldName = fields[f];
        var fieldValue = row[fieldName] ;
        if (typeof(fieldValue) == 'string'){
          if (fieldValue.indexOf(fieldSeparator) > -1) fieldValue = '"' + fieldValue + '"' ;
          if (fieldValue.indexOf(rowSeparator) > -1) fieldValue = fieldValue.replace(rowSeparator,"\\"+rowSeparator) ;
        }
        if (typeof(fieldValue) == 'number') {
          if (Math.round(fieldValue) != fieldValue){
            fieldValue = fieldValue.formatNumber() ;
          }
          
        }
        outputrow.push(fieldValue) ;
      }
    }
    output.push(outputrow.join(fieldSeparator)) ;
  }
  return output.join(rowSeparator) ;
},

module.exports.populateThisRelationshipOnRecord = function(config,populateThisCallBack){
  var field = config.field ;
  var record = config.record ;
  var relatedRecordId = record[field.name] ;
  var relatedEntity = field.entity ;
  sails.models[relatedEntity].findOne(relatedRecordId,function(err,foundRecord){
    if (err){
      populateThisCallBack(err) ;
    } else {
      if (foundRecord){
        record[field.name] = foundRecord ;
      } else {
        record[field.name] = null ;
      }
      populateThisCallBack() ;
    }
  });
},

module.exports.populateRelationshipsOnRecord = function(record,entityName,populateCallBack){
        
  var relationships = [] ;
  for (var attrname in sails.models[entityName]._attributes){
    var attr = sails.models[entityName]._attributes[attrname] ;
    if (attr.model){
      relationships.push({
        field: {
          name : attrname,
          entity: attr.model
        },
        record: record
      }) ;
    }
  }
  
  async.each(relationships,module.exports.populateThisRelationshipOnRecord,function(err){
    populateCallBack() ;
  });
},

module.exports.populateRelationshipsOnRecordArray = function(recordArray,entityName,populateOnArrayCallBack){
  
  function populate(record,callback){
    module.exports.populateRelationshipsOnRecord(record,entityName,function(err){
      callback(err);
    });
  }

  async.each(recordArray,populate,function(err){
    populateOnArrayCallBack();
  });
},

module.exports.attachedFilesList = function(classname, recordid, viewConfig, attachedFilesListCallBack){
  Fileuploads
    .find({classname:classname, recordid: recordid}, function(err,attachmentsFound){
      viewConfig.attachedFiles = attachmentsFound ;
      attachedFilesListCallBack(err) ;
    });
},

module.exports.findStringInArray = function(str, strArray){
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}
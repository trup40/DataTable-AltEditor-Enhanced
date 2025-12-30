/**
 * @summary altEditor
 * @description Lightweight editor for DataTables
 * @version 3.0
 * @file dataTables.editor.free.js
 * @author kingkode (www.kingkode.com)
 * Modified by: Eagle (https://github.com/trup40), Kasper Olesen (https://github.com/KasperOlesen), Luca Vercelli (https://github.com/luca-vercelli), Zack Hable (www.cobaltdevteam.com)
 * @contact www.kingkode.com/contact
 * @contact zack@cobaltdevteam.com
 * @copyright Copyright 2016 Kingkode
 *
 * This source file is free software, available under the following license: MIT
 * license
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 
 * FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 *
 */

// Global Configuration Flags
var altEditorFlags = {
    preventAddModal: false,      // Prevents opening the Add Modal
    preventEditModal: false,     // Prevents opening the Edit Modal
    preventDeleteModal: false,   // Prevents opening the Delete Modal
    preventAddSubmit: false,     // Prevents submitting the Add Form
    preventEditSubmit: false,    // Prevents submitting the Edit Form
    preventDeleteSubmit: false   // Prevents submitting the Delete Form
};

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'datatables.net'], function ($) {
            return factory($, window, document);
        });
    }
    else if (typeof exports === 'object') {
        // CommonJS
        module.exports = function (root, $) {
            if (!root) {
                root = window;
            }

            if (!$ || !$.fn.dataTable) {
                $ = require('datatables.net')(root, $).$;
            }

            return factory($, root, root.document);
        };
    }
    else {
        // Browser
        factory(jQuery, window, document);
    }
})
    (function ($, window, document, undefined) {
        'use strict';
        var DataTable = $.fn.dataTable;
        var _instance = 0;
        /**
         * altEditor provides modal editing of records for Datatables
         *
         * @class altEditor
         * @constructor
         * @param {object}
         * oTD DataTables settings object
         * @param {object}
         * oConfig Configuration object for altEditor
         */
        var altEditor = function (dt, opts) {
            if (!DataTable.versionCheck || !DataTable.versionCheck('1.10.8')) {
                throw ("Warning: altEditor requires DataTables 1.10.8 or greater");
            }

            // User and defaults configuration object
            this.c = $.extend(true, {}, DataTable.defaults.altEditor,
                altEditor.defaults, opts);

            /**
             * @namespace Settings object which contains customisable information
             * for altEditor instance
             */
            this.s = {
                /** @type {DataTable.Api} DataTables' API instance */
                dt: new DataTable.Api(dt),

                /** @type {String} Unique namespace for events attached to the document */
                namespace: '.altEditor' + (_instance++)
            };

            /**
             * @namespace Common and useful DOM elements for the class instance
             */
            this.dom = {
                /** @type {jQuery} altEditor handle */
                modal: $('<div class="dt-altEditor-handle"/>'),
            };

            /* Constructor logic */
            this._constructor();
        }

        $.extend(
            altEditor.prototype,
            {
                /***************************************************************
                 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
                 * Constructor * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
                 */

                /**
                 * Initialise the RowReorder instance
                 *
                 * @private
                 */
                _constructor: function () {
                    var that = this;
                    var dt = this.s.dt;

					// Adds controls before opening the modal
                    if (dt.settings()[0].oInit.onBeforeAddRow)
                        that.onBeforeAddRow = dt.settings()[0].oInit.onBeforeAddRow;
                    if (dt.settings()[0].oInit.onBeforeEditRow)
                        that.onBeforeEditRow = dt.settings()[0].oInit.onBeforeEditRow;
                    if (dt.settings()[0].oInit.onBeforeDeleteRow)
                        that.onBeforeDeleteRow = dt.settings()[0].oInit.onBeforeDeleteRow;
					// Adds controls after opening the modal
                    if (dt.settings()[0].oInit.onAfterAddRow)
                        that.onAfterAddRow = dt.settings()[0].oInit.onAfterAddRow;
                    if (dt.settings()[0].oInit.onAfterEditRow)
                        that.onAfterEditRow = dt.settings()[0].oInit.onAfterEditRow;
                    if (dt.settings()[0].oInit.onAfterDeleteRow)
                        that.onAfterDeleteRow = dt.settings()[0].oInit.onAfterDeleteRow;
					
					// Adds controls before submitting the modal
                    if (dt.settings()[0].oInit.onBeforeAddSubmitRow)
                        that.onBeforeAddSubmitRow = dt.settings()[0].oInit.onBeforeAddSubmitRow;
                    if (dt.settings()[0].oInit.onBeforeEditSubmitRow)
                        that.onBeforeEditSubmitRow = dt.settings()[0].oInit.onBeforeEditSubmitRow;
                    if (dt.settings()[0].oInit.onBeforeDeleteSubmitRow)
                        that.onBeforeDeleteSubmitRow = dt.settings()[0].oInit.onBeforeDeleteSubmitRow;
					
                    if (dt.settings()[0].oInit.onAddRow)
                        that.onAddRow = dt.settings()[0].oInit.onAddRow;
                    if (dt.settings()[0].oInit.onDeleteRow)
                        that.onDeleteRow = dt.settings()[0].oInit.onDeleteRow;
                    if (dt.settings()[0].oInit.onEditRow)
                        that.onEditRow = dt.settings()[0].oInit.onEditRow;

                    that.closeModalOnSuccess = dt.settings()[0].oInit.closeModalOnSuccess;
                    if (that.closeModalOnSuccess === undefined) {
                        that.closeModalOnSuccess = true;
                    }

                    that.altEditorDelButtons = dt.settings()[0].oInit.altEditorDelButtons;
					
					that.encodeFiles = dt.settings()[0].oInit.encodeFiles;
					if (that.encodeFiles === undefined) {
						that.encodeFiles = false;
					}

                    this._setup();

                    dt.on('destroy.altEditor', function () {
                        dt.off('.altEditor');
                        $(dt.table().body()).off(that.s.namespace);
                        $(document.body).off(that.s.namespace);
                    });
                },

                /***************************************************************
                 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
                 * Private methods * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
                 */

                /**
                 * Setup dom and bind button actions
                 *
                 * @private
                 */
                _setup: function () {
                    var that = this;
                    var dt = this.s.dt;
                    // this.random_id = ("" + Math.random()).replace(".", "");
                    this.random_id = 'alt-editor-idd';
                    var modal_id = 'altEditor-modal-' + this.random_id;
                    this.modal_selector = '#' + modal_id;
                    // this.language = DataTable.settings.values().next().value.oLanguage.altEditor || {};
					this.language = dt.settings()[0].oLanguage.altEditor || {};
                    this.language.modalClose = this.language.modalClose || 'Close';
                    this.language.edit = this.language.edit || {};
                    this.language.edit = {
                        title: this.language.edit.title || 'Edit',
                        button: this.language.edit.button || 'Edit'
                    };
                    this.language.delete = this.language.delete || {};
                    this.language.delete = {
                        title: this.language.delete.title || 'Delete',
                        button: this.language.delete.button || 'Delete'
                    };
                    this.language.add = this.language.add || {};
                    this.language.add = {
                        title: this.language.add.title || 'Add',
                        button: this.language.add.button || 'Add'
                    };
                    this.language.success = this.language.success || 'Success!';
                    this.language.error = this.language.error || {};
                    this.language.error = {
                        message: this.language.error.message || 'There was an unknown error!',
                        label: this.language.error.label || 'Error!',
                        responseCode: this.language.error.responseCode || 'Response code: ',
                        required: this.language.error.required || 'Field is required',
                        unique: this.language.error.unique || 'Duplicated field'
                    };

                    var modal = '<div class="modal fade altEditor-modal reveal" id="' + modal_id + '" role="dialog" data-reveal>' +
                        '<div class="modal-dialog modal-lg">' +
                        '<div class="modal-content">' +
                        '<div class="modal-header pd-0-f">' +
                        '<h4 style="padding-top: 0.5rem;padding-left: 1rem;" class="modal-title"></h4>' +
                        '<button style="margin: initial;" type="button" class="close close-button" data-dismiss="modal" data-close aria-label="' + this.language.modalClose + '">' +
                        '<span aria-hidden="true">&times;</span></button>' +
                        '</div>' +
                        '<div class="modal-body">' +
                        '<p></p>' +
                        '</div>' +
                        '<div class="modal-footer">' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    // add modal
                    $('body').append(modal);
					
                    // add Edit Button
					if (dt.button('edit:name')) {
						dt.button('edit:name').action(function (e, dt, node, config) {
							// tableID = node.closest('.dataTables_wrapper').find('table').attr('id');
							that._beforeEditModal();
							// that._openEditModal();

							$('#altEditor-edit-form-' + that.random_id)
								.off('submit')
								.on('submit', function (e) {
									e.preventDefault();
									e.stopPropagation();
									// that._editRowData(tableID);
									$('#editRowBtn').prop('disabled',true);
									// that._editRowData();
									that._beforeEditRowData();
								});
						});
					}

                    // add Delete Button
					if (dt.button('delete:name')) {
						dt.button('delete:name').action(function (e, dt, node, config) {
							// tableID = node.closest('.dataTables_wrapper').find('table').attr('id');
							that._beforeDeleteModal();
							// that._openDeleteModal();

							$('#altEditor-delete-form-' + that.random_id)
								.off('submit')
								.on('submit', function (e) {
									e.preventDefault();
									e.stopPropagation();
									// that._deleteRow(tableID);
									// that._deleteRow();
									that._beforeDeleteRowData();
								});
						});
					}
                    
                    // add Add Button
					if (dt.button('add:name')) {
						dt.button('add:name').action(function (e, dt, node, config) {
							// tableID = node.closest('.dataTables_wrapper').find('table').attr('id');
							// that._openAddModal(tableID);
							that._beforeAddModal();
							// that._openAddModal();

							$('#altEditor-add-form-' + that.random_id)
								.off('submit')
								.on('submit', function (e) {
									e.preventDefault();
									e.stopPropagation();
									// that._addRowData(tableID);
									$('#addRowBtn').prop('disabled',true);
									// that._addRowData();
									that._beforeAddRowData();
								});
						});
					}

                    // add Refresh button
					if (this.s.dt.button('refresh:name')) {
						this.s.dt.button('refresh:name').action(function (e, dt, node, config) {
							if (dt.ajax && dt.ajax.url()) {
								dt.ajax.reload();
							}
						});
					}
					
					if(that.altEditorDelButtons){
						that.altEditorDelButtons.forEach(myFunction);
						function myFunction(item, index) {
						  dt.button(item + ":name").remove()
						}}

                    // bind 'unique' error messages
                    $(this.modal_selector).bind('input', '[data-unique]', function (elm) {
                        if ($(elm.target).attr('data-unique') == null || $(elm.target).attr('data-unique') === 'false') {
                            return;
                        }
                        var target = $(elm.target);
                        var colData = dt.column("th:contains('" + target.attr("name") + "')").data();
                        // go through each item in this column
                        var selectedCellData = null;
                        if (dt.row({ selected: true }).index() != null)
                            selectedCellData = dt.cell(dt.row({ selected: true }).index(), dt.column("th:contains('" + target.attr("name") + "')").index()).data();
                        elm.target.setCustomValidity('');
                        for (var j in colData) {
                            // if the element is in the column and its not the selected one then its not unique
                            if (target.val() == colData[j] && colData[j] != selectedCellData) {
                                elm.target.setCustomValidity(that.language.error.unique);
                            }
                        }
                    });
                },

                /**
                 * Emit an event on the DataTable for listeners
                 *
                 * @param {string}
                 * name Event name
                 * @param {array}
                 * args Event arguments
                 * @private
                 */
                _emitEvent: function (name, args) {
                    this.s.dt.iterator('table', function (ctx, i) {
                        $(ctx.nTable).triggerHandler(name + '.dt', args);
                    });
                },

                /**
                 * Open Edit Modal for selected row
                 *
                 * @private
                 */
                // _openEditModal: function (tableID) {
                _openEditModal: function () {

                    var dt = this.s.dt;
                    var adata = dt.rows({
                        selected: true
                    });

                    var columnDefs = this.completeColumnDefs();
                    var data = this.createDialog(columnDefs, this.language.edit.title, this.language.edit.button,
                        this.language.modalClose, 'editRowBtn', 'altEditor-edit-form');

                    var selector = this.modal_selector;

                    for (var j in columnDefs) {
                        if (columnDefs[j].name != null) {
                            var arrIndex = columnDefs[j].name.toString().split(".");
                            var selectedValue = adata.data()[0];
                            for (var index = 0; index < arrIndex.length; index++) {
                                if (selectedValue) selectedValue = selectedValue[arrIndex[index]];
                            }
                            var jquerySelector = "#" + columnDefs[j].name.toString().replace(/\./g, "\\.");
							
							if (columnDefs[j].type.indexOf("file") < 0){
								$(selector).find(jquerySelector).val(selectedValue);    // this._quoteattr or not? see #121
							}

                            //added select
                            if (columnDefs[j].type == 'select') {
                                var SelectedValues = [];
                                var SelectedNewValues = [];
                                var delimitedValues = selectedValue.split(", ");

                                for (var i = 0; i < delimitedValues.length; i++) {
                                    var text2val = $(selector).find(jquerySelector + ' option').filter(function () { return $(this).html() == delimitedValues[i] }).val();

                                    if (text2val != undefined) {
                                        SelectedValues[i] = text2val;
                                    }
                                    else {
                                        var newOption = new Option(delimitedValues[i], delimitedValues[i], true, true);
                                        SelectedNewValues[i] = newOption;
                                    }
                                }

                                $(selector).find(jquerySelector).val(SelectedValues).trigger('change');

                                if (SelectedNewValues.length != 0) {
                                    $(selector).find(jquerySelector).append(SelectedNewValues).trigger('change');
                                }
                            }
                            //added checkbox
                            if (columnDefs[j].type.indexOf("checkbox") >= 0) {
                                if (this._quoteattr(selectedValue) === "true") {
                                    $(selector).find(jquerySelector).prop("checked", this._quoteattr(selectedValue)); // required by checkbox
                                }
                            }
                            //added date
                            if (columnDefs[j].type.indexOf("date") >= 0) {
                                if (columnDefs[j].dateFormat !== "") {
                                    var mDate = moment(this._quoteattr(selectedValue));
                                    if (mDate && mDate.isValid()) {
                                        $(selector).find(jquerySelector).val(mDate.format(columnDefs[j].dateFormat));
                                    }
                                }
                            }
							// for bootstrap datepicker
                            if (columnDefs[j].bootstrapdatepicker) {
                                $(selector).find(jquerySelector).bootstrapdatepicker('update')
                            }
                        }
                    }

                    $(selector + ' input[0]').trigger('focus');
                    $(selector).trigger("alteditor:some_dialog_opened").trigger("alteditor:edit_dialog_opened");
					
					this._afterEditModal();
                },

                /**
                 * Callback for "Edit" button
                 */
                // _editRowData: function (tableID) {
                _editRowData: function () {
                    var that = this;
                    var dt = this.s.dt;

                    // Complete new row data
                    var rowDataArray = {};

                    var adata = dt.rows({
                        selected: true
                    });

                    // Getting the inputs from the edit-modal
                    $('form[name="altEditor-edit-form-' + this.random_id + '"] *').filter(':input[type!="file"]').each(function (i) {
                        rowDataArray[$(this).attr('id')] = $(this).val();
                    });

                    // Getting the selects from the edit-modal
                    $('form[name="altEditor-edit-form-' + this.random_id + '"] *').filter('select').each(function (i) {

                        var data = $(this).select2('data');
                        var multi = '';
						var wanted = $(this).attr("selectwanted");

                        for (var i = 0; i < data.length; i++) {
                            if (wanted == "id")
							{
								multi += data[i].id;
							}
							else
							{
								multi += data[i].text;
							}
							
                            multi = (i != (data.length - 1)) ? (multi + ", ") : multi;
                        }

                        rowDataArray[$(this).attr('id')] = multi;
                    });

                    //Getting the textArea from the modal
                    $('form[name="altEditor-edit-form-' + this.random_id + '"] *').filter('textarea').each(function (i) {
                        rowDataArray[$(this).attr('id')] = $(this).val();
                    });

                    //Getting Files from the modal
                    var numFilesQueued = 0;
                    $('form[name="altEditor-edit-form-' + this.random_id + '"] *').filter(':input[type="file"]').each(function (i) {
						var fileID = $(this).attr("id");
						var fileName = $(this).val().replace(/C:\\fakepath\\/i, '');
                       
						if ($(this).prop('files')[0]) {
							if (that.encodeFiles) {
                            ++numFilesQueued;
                            that.getBase64($(this).prop('files')[0], function (filecontent) {
								rowDataArray[fileID] = filecontent;
								rowDataArray[fileID + "label"] = fileName;
								rowDataArray["uploadtur"] = "base64";
								--numFilesQueued;
                            });
							} else {
								rowDataArray[fileID] = $(this).prop('files')[0];
								rowDataArray[fileID + "label"] = fileName;
								rowDataArray["uploadtur"] = "file";
							}
						}
						else {rowDataArray["uploadtur"] = "none"}
                    });

                    // Getting the checkbox from the modal
                    $('form[name="altEditor-edit-form-' + this.random_id + '"] *').filter(':input[type="checkbox"]').each(function (i) {
                        rowDataArray[$(this).attr('id')] = this.checked;
                    });

                    var checkFilesQueued = function () {
                       if (numFilesQueued == 0) {
                           that.onEditRow(that,
                               rowDataArray,
                               function (data, b, c, d, e) { that._editRowCallback(data, b, c, d, e); },
                               function (data) { that._errorCallback(data); });
                       } else {
                           // console.log("Waiting for file base64-decoding...");
                           setTimeout(checkFilesQueued, 1000);
                       }
                    };

                    checkFilesQueued();

                    // console.log(rowDataArray); //DEBUG
                },

                /**
                 * Open Delete Modal for selected row
                 *
                 * @private
                 */
                _openDeleteModal: function () {

                    var that = this;
                    var dt = this.s.dt;
                    var adata = dt.rows({
                        selected: true
                    });
                    var columnDefs = this.completeColumnDefs();
                    var formName = 'altEditor-delete-form-' + this.random_id;

                    // TODO
                    // we should use createDialog()
                    // var data = this.createDialog(columnDefs, this.language.delete.title, this.language.delete.button,
                    //      this.language.modalClose, 'deleteRowBtn', 'altEditor-delete-form');

                    // Building delete-modal
                    var data = "";

                    for (var j in columnDefs) {
                        if (columnDefs[j].name == null) continue;
                        if (columnDefs[j].type.indexOf("hidden") >= 0) {
                            data += "<input type='hidden' id='" + columnDefs[j].title + "' value='" + adata.data()[0][columnDefs[j].name] + "'></input>";
                        }
                        else if (columnDefs[j].type.indexOf("file") < 0) {
                            var arrIndex = columnDefs[j].name.toString().split(".")
                            var fvalue = adata.data()[0];  //fvalue is the value that will appear to user
                            for (var index = 0; index < arrIndex.length; index++) {

                                if (fvalue) fvalue = fvalue[arrIndex[index]];
                            }

                            // fix dateFormat
                            if (columnDefs[j].type.indexOf("date") >= 0) {
                                if (columnDefs[j].dateFormat !== "") {
                                    var mDate = moment(adata.data()[0][columnDefs[j].name]);
                                    if (mDate && mDate.isValid()) {
                                        fvalue = mDate.format(columnDefs[j].dateFormat);
                                    }
                                }
                            }

                            // fix select
                            if (columnDefs[j].type.indexOf("select") >= 0) {
                                var options = columnDefs[j].options;
                                
								var mapper = function(x) {
									if (options.length === undefined) {
										// options is a map
										return x in options ? options[x] : null;
									} else {
										// options is an array
										return x;
									}
								}

								if (fvalue instanceof Array) {
									// multiselect
									var mapped = fvalue.map(mapper)
										.filter(function (x) {
											return x != null;
										});
									fvalue = mapped.join(', ');
								} else {
									// usual select
									fvalue = mapper(fvalue);
								}
                            }

                            data += "<div style='margin-left: initial;margin-right: initial;' class='form-group row'><label for='"
                                + that._quoteattr(columnDefs[j].name)
                                + "'>"
                                + columnDefs[j].title
                                + ":&nbsp</label> <input  type='hidden'  id='"
                                + that._quoteattr(columnDefs[j].title)
                                + "' name='"
                                + that._quoteattr(columnDefs[j].title)
                                + "' placeholder='"
                                + that._quoteattr(columnDefs[j].placeholder)
                                + "' style='overflow:hidden'  class='form-control' value='"
                                + that._quoteattr(fvalue) + "' >"
                                + fvalue
                                + "</input></div>";
                        }
                    }

                    var selector = this.modal_selector;
                    var fill = function () {
                        var btns = '<button type="button" data-content="remove" class="btn btn-default button secondary" data-close data-dismiss="modal">' + that.language.modalClose + '</button>' +
                            '<button type="submit"  data-content="remove" class="btn btn-danger button" id="deleteRowBtn">' + that.language.delete.button + '</button>';
                        $(selector).find('.modal-title').html(that.language.delete.title);
                        $(selector).find('.modal-body').html(data);
					$(selector).find('.modal-body').append("<hr/><div style='color:black; text-align:center'>Are you sure you want to delete?</div>");
                        $(selector).find('.modal-footer').html(btns);
                        var modalContent = $(selector).find('.modal-content');
                        if (modalContent.parent().is('form')) {
                            modalContent.parent().attr('name', formName);
                            modalContent.parent().attr('id', formName);
                        } else {
                            modalContent.wrap("<form name='" + formName + "' id='" + formName + "' role='form'></form>");
                        }
                    };
                    this.internalOpenDialog(selector, fill);
                    $(selector + ' input[0]').trigger('focus');
                    $(selector).trigger("alteditor:some_dialog_opened").trigger("alteditor:delete_dialog_opened");
                },

                /**
                 * Callback for "Delete" button
                 */
                // _deleteRow: function (tableID) {
                _deleteRow: function () {
                    var that = this;
                    var dt = this.s.dt;

                    var jsonDataArray = {};

                    var adata = dt.rows({
                        selected: true
                    });

                    // Getting the IDs and Values of the tablerow
                    for (var i = 0; i < dt.context[0].aoColumns.length; i++) {
                        // .data is the attribute name, if any; .idx is the column index, so it should always exists
                        var name = dt.context[0].aoColumns[i].data ? dt.context[0].aoColumns[i].data :
                            dt.context[0].aoColumns[i].mData ? dt.context[0].aoColumns[i].mData :
                                dt.context[0].aoColumns[i].idx;
                        jsonDataArray[name] = adata.data()[0][name];
                    }
                    that.onDeleteRow(that,
                        jsonDataArray,
                        function (data) { that._deleteRowCallback(data); },
                        function (data) { that._errorCallback(data); });
                },

                /**
                 * Open BeforeAdd Modal for selected row
                 *
                 * @private
                 */
                _beforeAddModal: function () {
                    var dt = this.s.dt;
                    
					this.onBeforeAddRow(this, dt.context[0], dt.context[0].sTableId);
					
					if (!altEditorFlags.preventAddModal)
						this._openAddModal();
                },

                /**
                 * Open BeforeEdit Modal for selected row
                 *
                 * @private
                 */
                _beforeEditModal: function () {
                    var dt = this.s.dt;
                    
					this.onBeforeEditRow(this, dt.context[0], dt.context[0].sTableId);
					
					if (!altEditorFlags.preventEditModal)
						this._openEditModal();
                },

                /**
                 * Open BeforeEdit Modal for selected row
                 *
                 * @private
                 */
                _beforeDeleteModal: function () {
                    var dt = this.s.dt;
                    
					this.onBeforeDeleteRow(this, dt.context[0], dt.context[0].sTableId);
					
					if (!altEditorFlags.preventDeleteModal)
						this._openDeleteModal();
                },

                /**
                 * Open AfterAdd Modal for selected row
                 *
                 * @private
                 */
                _afterAddModal: function () {
                    var dt = this.s.dt;
                    
					this.onAfterAddRow(this, dt.context[0], dt.context[0].sTableId); 
                },

                /**
                 * Open AfterEdit Modal for selected row
                 *
                 * @private
                 */
                _afterEditModal: function () {
                    var dt = this.s.dt;
                    
					this.onAfterEditRow(this, dt.context[0], dt.context[0].sTableId); 
                },

                /**
                 * Open AfterEdit Modal for selected row
                 *
                 * @private
                 */
                _afterDeleteModal: function () {
                    var dt = this.s.dt;
                    
					this.onAfterDeleteRow(this, dt.context[0], dt.context[0].sTableId); 
                },

                /**
                 * Open Add Modal for selected row
                 *
                 * @private
                 */
                _openAddModal: function () {
                    var dt = this.s.dt;
                    var columnDefs = this.completeColumnDefs();
                    var data = this.createDialog(columnDefs, this.language.add.title, this.language.add.button,
                        this.language.modalClose, 'addRowBtn', 'altEditor-add-form');

                    var selector = this.modal_selector;
                    $(selector + ' input[0]').trigger('focus');
                    $(selector).trigger("alteditor:some_dialog_opened").trigger("alteditor:add_dialog_opened");
                    setTimeout(function () { $('.modal-body select').val(null).trigger('change'); }, 300);
					this._afterAddModal();
                },

                /**
                * Complete DataTable.context[0].aoColumns with default values
                */
                completeColumnDefs: function () {
                    var columnDefs = [];
                    var dt = this.s.dt;
                    for (var i in dt.context[0].aoColumns) {
                        var obj = dt.context[0].aoColumns[i];
                        columnDefs[i] = {
                            title: obj.sTitle,
                            name: (obj.data ? obj.data : obj.mData),
                            type: (obj.type ? obj.type : 'text'),
                            rows: (obj.rows ? obj.rows : '5'),
                            cols: (obj.cols ? obj.cols : '30'),
                            min: (obj.min ? obj.min : ''),
                            max: (obj.max ? obj.max : ''),
                            step: (obj.step ? obj.step : ''),
                            accept: (obj.accept ? obj.accept : ''),
                            maxsize: (obj.maxsize ? obj.maxsize : ''),
                            options: (obj.options ? obj.options : []),
                            readonly: (obj.readonly ? obj.readonly : false),
                            disabled: (obj.disabled ? obj.disabled : false),
                            required: (obj.required ? obj.required : false),
                            msg: (obj.errorMsg ? obj.errorMsg : ''),        // FIXME no more used
                            hoverMsg: (obj.hoverMsg ? obj.hoverMsg : ''),
                            pattern: (obj.pattern ? obj.pattern : '.*'),
                            special: (obj.special ? obj.special : ''),
                            placeholder: (obj.placeholder ? obj.placeholder : obj.title),
                            unique: (obj.unique ? obj.unique : false),
                            uniqueMsg: (obj.uniqueMsg ? obj.uniqueMsg : ''),        // FIXME no more used
                            maxLength: (obj.maxLength ? obj.maxLength : false),
                            multiple: (obj.multiple ? obj.multiple : false),
                            select2: (obj.select2 ? obj.select2 : false),
                            selectwanted: (obj.selectwanted ? obj.selectwanted : 'id'),
                            bootstrapdatepicker: (obj.bootstrapdatepicker ? obj.bootstrapdatepicker : false),
                            datepicker: (obj.datepicker ? obj.datepicker : false),
                            datetimepicker: (obj.datetimepicker ? obj.datetimepicker : false),
                            editorOnChange: (obj.editorOnChange ? obj.editorOnChange : null),
                            style: (obj.style ? obj.style : ''),
                            dateFormat: (obj.dateFormat ? obj.dateFormat : ''),
                            optionsSortByLabel: (obj.optionsSortByLabel ? obj.optionsSortByLabel : false),
							inline: (obj.inline ? obj.inline : false )
                        }
                    }
                    return columnDefs;
                },

                /**
                * Create both Edit and Add dialogs
                * @param columnDefs as returned by completeColumnDefs()
                */
                createDialog: function (columnDefs, title, buttonCaption, closeCaption, buttonClass, formName) {
                    formName = [formName, this.random_id].join('-');
                    var data = "", count=0;
                    for (var j in columnDefs) {

                        //handle hidden fields
                        if (columnDefs[j].type.indexOf("hidden") >= 0) {
                            data += "<input type='hidden' id='" + columnDefs[j].name + "' ></input>";
                        }
                        else {
                            // handle fields that are visible to the user

                            if(columnDefs[j].inline){ //to add upto 4 inline columns
								if(count==0) {
									count++;
									data += "<div style='margin-left: initial;margin-right: initial;' class='form-group row' id='alteditor-row-" + this._quoteattr(columnDefs[j].name) + "'>";
									data += "<div class='col-sm-3 col-md-3 col-lg-3 text-center text-sm-right' style='padding-top:4px;'>";
									data += "<label for='" + columnDefs[j].name + "'>" + columnDefs[j].title + ":</label></div>";
									data += "<div class='col-sm-2 col-md-2 col-lg-2'>";
								}
								else
									data += "<div class='col-sm-2 col-md-2 col-lg-2'>";
							}
							else{
								data += "<div style='margin-left: initial;margin-right: initial;' class='form-group row' id='alteditor-row-" + this._quoteattr(columnDefs[j].name) +"'>";
								data += "<div class='col-sm-3 col-md-3 col-lg-3 text-center text-sm-right' style='padding-top:4px;'>";
								data += "<label for='" + columnDefs[j].name + "'>" + columnDefs[j].title + ":</label></div>";
								data += "<div class='col-sm-8 col-md-8 col-lg-8'>";
							}

                            // Adding readonly-fields
                            if (columnDefs[j].type.indexOf("readonly") >= 0) {
                                // type=readonly is deprecated, kept for backward compatibility
                                data += "<input type='text' readonly  id='"
                                    + this._quoteattr(columnDefs[j].name)
                                    + "' name='"
                                    + this._quoteattr(columnDefs[j].title)
                                    + "' placeholder='"
                                    + this._quoteattr(columnDefs[j].placeholder)
                                    + "' style='overflow:hidden'  class='form-control  form-control-sm' value=''>";
                            }
                            // Adding select-fields
                            else if (columnDefs[j].type.indexOf("select") >= 0) {
                                var options = "";
                                var optt = "";
                                var optionsArray = columnDefs[j].options;
                                $.each(JSON.parse(optionsArray), function (i, item) {
                                    if (item.id == null || item.id == 'undefined') {
                                        options = options + '<optgroup class="select2-result-selectable" label="' + item.text + '">';

                                        for (var a = 0; a < item.children.length; a++) {
                                            optt = optt + '<option value="' + item.children[a].id + '" data-points="' + item.children[a].points + '">' + item.children[a].text + '</option>'
                                        };
                                        options = options + optt + '</optgroup>';
                                        optt = "";
                                    }
                                    else {
                                        options = options + '<option value="' + item.id + '" data-points="' + item.points + '">' + item.text + '</option>'
                                    }
                                });

                                data += "<select class='form-control" + (columnDefs[j].select2 ? ' select2' : '')
                                    + "' id='" + this._quoteattr(columnDefs[j].name)
                                    + "' name='" + this._quoteattr(columnDefs[j].title)
                                    + "' selectwanted='" + this._quoteattr(columnDefs[j].selectwanted)
                                    + "' placeholder='" + this._quoteattr(columnDefs[j].placeholder)
                                    + "' data-special='" + this._quoteattr(columnDefs[j].special)
                                    + "' data-errorMsg='" + this._quoteattr(columnDefs[j].msg)
                                    + "' data-uniqueMsg='" + this._quoteattr(columnDefs[j].uniqueMsg)
                                    + "' data-unique='" + columnDefs[j].unique
                                    + "' "
                                    + (columnDefs[j].readonly ? ' readonly ' : '')
                                    + (columnDefs[j].disabled ? ' disabled ' : '')
                                    + (columnDefs[j].required ? ' required ' : '')
                                    + (columnDefs[j].multiple ? ' multiple ' : '')
                                    + ">" + options
                                    + "</select>";
                            }
                            //Adding Text Area
                            else if (columnDefs[j].type.indexOf("textarea") >= 0) {
                                data += "<textarea class='form-control' id='" + this._quoteattr(columnDefs[j].name)
                                    + "' name='" + this._quoteattr(columnDefs[j].title)
                                    + "' rows='" + this._quoteattr(columnDefs[j].rows)
                                    + "' cols='" + this._quoteattr(columnDefs[j].cols)
                                    + "' placeholder='" + this._quoteattr(columnDefs[j].placeholder)
                                    + "' data-special='" + this._quoteattr(columnDefs[j].special)
                                    + "' data-errorMsg='" + this._quoteattr(columnDefs[j].msg)
                                    + "' data-uniqueMsg='" + this._quoteattr(columnDefs[j].uniqueMsg)
                                    + "' data-unique='" + columnDefs[j].unique
                                    + "' "
                                    + (columnDefs[j].readonly ? ' readonly ' : '')
                                    + (columnDefs[j].disabled ? ' disabled ' : '')
                                    + (columnDefs[j].required ? ' required ' : '')
                                    + (columnDefs[j].maxLength == false ? "" : " maxlength='" + columnDefs[j].maxLength + "'")
                                    + " style='" + this._quoteattr(columnDefs[j].style) + "'>"
                                    + "</textarea>";
                            }
                            //Adding Number
                            else if (columnDefs[j].type.indexOf("number") >= 0) {
                                data += "<input class='form-control' type='" + this._quoteattr(columnDefs[j].type)
                                    + "' id='" + this._quoteattr(columnDefs[j].name)
                                    + "' min='" + this._quoteattr(columnDefs[j].min)
                                    + "' max='" + this._quoteattr(columnDefs[j].max)
                                    + "' step='" + this._quoteattr(columnDefs[j].step)
                                    + "' title='" + this._quoteattr(columnDefs[j].hoverMsg)
                                    + "' name='" + this._quoteattr(columnDefs[j].title)
                                    + "' placeholder='" + this._quoteattr(columnDefs[j].placeholder)
                                    + "' data-special='" + this._quoteattr(columnDefs[j].special)
                                    + "' data-errorMsg='" + this._quoteattr(columnDefs[j].msg)
                                    + "' data-uniqueMsg='" + this._quoteattr(columnDefs[j].uniqueMsg)
                                    + "' data-unique='" + columnDefs[j].unique
                                    + "' "
                                    + (columnDefs[j].readonly ? ' readonly ' : '')
                                    + (columnDefs[j].disabled ? ' disabled ' : '')
                                    + (columnDefs[j].required ? ' required ' : '')
                                    + (columnDefs[j].maxLength == false ? "" : " maxlength='" + columnDefs[j].maxLength + "'")
                                    + " style='overflow:hidden;" + this._quoteattr(columnDefs[j].style)
                                    + " value=''>";
                            }
                            //Adding File
                            // else if (columnDefs[j].type.indexOf("text") >= 0 && columnDefs[j].special == "upload") {
                                // data += "<input class='bd pd-5 btn btn-primary wd-100p' type='file"
                                    // + "' id='" + this._quoteattr(columnDefs[j].name)
                                    // + "' name='" + this._quoteattr(columnDefs[j].name)
                                    // + "' accept='" + this._quoteattr(columnDefs[j].accept)
                                    // + "' maxsize='" + this._quoteattr(columnDefs[j].maxsize)
                                    // + "' data-special='" + this._quoteattr(columnDefs[j].special)
                                    // + "' data-errorMsg='" + this._quoteattr(columnDefs[j].msg)
                                    // + "' data-uniqueMsg='" + this._quoteattr(columnDefs[j].uniqueMsg)
                                    // + "' data-unique='" + columnDefs[j].unique
                                    // + "' "
                                    // + (columnDefs[j].required ? ' required ' : '')
                                    // + (columnDefs[j].maxLength == false ? "" : " maxlength='" + columnDefs[j].maxLength + "'")
                                    // + " style='overflow:hidden;" + this._quoteattr(columnDefs[j].style) + ">"
                            // }
                            else if (columnDefs[j].type.indexOf("file") >= 0) {
                                data += "<input class='bd pd-5 btn btn-primary wd-100p' type='file"
                                    + "' id='" + this._quoteattr(columnDefs[j].name)
                                    + "' name='" + this._quoteattr(columnDefs[j].name)
                                    + "' accept='" + this._quoteattr(columnDefs[j].accept)
                                    + "' maxsize='" + this._quoteattr(columnDefs[j].maxsize)
                                    + "' data-special='" + this._quoteattr(columnDefs[j].special)
                                    + "' data-errorMsg='" + this._quoteattr(columnDefs[j].msg)
                                    + "' data-uniqueMsg='" + this._quoteattr(columnDefs[j].uniqueMsg)
                                    + "' data-unique='" + columnDefs[j].unique
                                    + "' "
                                    + (columnDefs[j].required ? ' required ' : '')
                                    + (columnDefs[j].maxLength == false ? "" : " maxlength='" + columnDefs[j].maxLength + "'")
                                    + " style='overflow:hidden;" + this._quoteattr(columnDefs[j].style) + ">"
                            }
                            // Adding text-inputs and error labels, but also new HTML5 types (email, color, ...)
                            else {
                                data += "<input class='form-control' type='" + this._quoteattr(columnDefs[j].type)
                                    + "' id='" + this._quoteattr(columnDefs[j].name)
                                    + "' pattern='" + this._quoteattr(columnDefs[j].pattern)
                                    + "' title='" + this._quoteattr(columnDefs[j].hoverMsg)
                                    + "' name='" + this._quoteattr(columnDefs[j].title)
                                    + "' placeholder='" + this._quoteattr(columnDefs[j].placeholder)
                                    + "' data-special='" + this._quoteattr(columnDefs[j].special)
                                    + "' data-errorMsg='" + this._quoteattr(columnDefs[j].msg)
                                    + "' data-uniqueMsg='" + this._quoteattr(columnDefs[j].uniqueMsg)
                                    + "' data-unique='" + columnDefs[j].unique
                                    + "' "
                                    + (columnDefs[j].readonly ? ' readonly ' : '')
                                    + (columnDefs[j].disabled ? ' disabled ' : '')
                                    + (columnDefs[j].required ? ' required ' : '')
                                    + (columnDefs[j].maxLength == false ? "" : " maxlength='" + columnDefs[j].maxLength + "'")
                                    + " style='overflow:hidden;" + this._quoteattr(columnDefs[j].style)
                                    + "' value=''>";
                            }
                            // data += "<label id='" + this._quoteattr(columnDefs[j].name) + "label"
                                // + "' class='errorLabel'></label>";
                            if(!columnDefs[j].inline || (+j+1 < columnDefs.length && !columnDefs[+j+1].inline)) {
								data += "</div><div style='clear:both;'></div></div>";
							}
							else
								data += "</div>";
							}
                    }
                    // data += "</form>";

                    var selector = this.modal_selector;
                    var fill = function () {
                        var btns = '<button type="button" data-content="remove" class="btn btn-default button secondary" data-dismiss="modal" data-close>' + closeCaption + '</button>' +
                            '<button type="submit" form="' + formName + '" data-content="remove" class="btn btn-primary button" id="' + buttonClass + '">' + buttonCaption + '</button>';
                        $(selector).find('.modal-title').html(title);
                        $(selector).find('.modal-body').html(data);
                        $(selector).find('.modal-footer').html(btns);
                        var modalContent = $(selector).find('.modal-content');
                        if (modalContent.parent().is('form')) {
                            modalContent.parent().attr('name', formName);
                            modalContent.parent().attr('id', formName);
                        } else {
                            modalContent.wrap("<form name='" + formName + "' id='" + formName + "' role='form'></form>");
                        }
                    };

                    this.internalOpenDialog(selector, fill);
                    $(selector + ' input[0]').trigger('focus');

                    var that = this;

                    // enable select 2 items, datepicker, datetimepickerm
                    for (var j in columnDefs) {
                        if (columnDefs[j].select2) {
                            // Require select2 plugin
                            //sort setting based on text data
                            columnDefs[j].select2.sorter = (columnDefs[j].optionsSortByLabel) ? data => data.sort((a, b) => a.text.localeCompare(b.text)) : data => data.sort();
                            $(selector).find("select#" + columnDefs[j].name).select2(columnDefs[j].select2);
                        } else if (columnDefs[j].bootstrapdatepicker) { // bootstrap datepicker setting
                            //if (bsReady == 0) {
                            //    var datepicker = $.fn.datepicker.noConflict();
                            //    $.fn.bootstrapdatepicker = datepicker;
                            //    bsReady = 1;
                            //}
                            $(selector).find("#" + columnDefs[j].name).bootstrapdatepicker(columnDefs[j].bootstrapdatepicker)
                        } else if (columnDefs[j].datepicker) {
                            // Require jquery-ui
                            $(selector).find("#" + columnDefs[j].name).datepicker(columnDefs[j].datepicker);
                        } else if (columnDefs[j].datetimepicker) {
                            // Require datetimepicker plugin
                            $(selector).find("#" + columnDefs[j].name).datetimepicker(columnDefs[j].datetimepicker);
                        }
                        // custom onchange triggers
                        if (columnDefs[j].editorOnChange) {
                            // $.escapeSelector requires jQuery 3.x
                            $(selector).find("#" + $.escapeSelector(columnDefs[j].name)).attr('alt-editor-id', this._quoteattr(j));
                            $(selector).find("#" + columnDefs[j].name).on('change', function (elm) {
                                var f = columnDefs[$(this).attr('alt-editor-id')].editorOnChange;
                                f(elm, that);
                            });
                        }
                        //added select sort
                        if (columnDefs[j].type.indexOf("select") >= 0) {
                            if (columnDefs[j].optionsSortByLabel) {
                                var jquerySelector = "#" + columnDefs[j].name.toString().replace(/\./g, "\\.");
                                var opts_list = $(selector).find(jquerySelector).find('option');
                                opts_list.sort(function (a, b) { return $(a).text() > $(b).text() ? 1 : -1; });
                                $(selector).find(jquerySelector).html('').append(opts_list);
                                $(selector).find(jquerySelector).val($(jquerySelector + " option:first").val());
                            }
                        }
                    }
                },

                /**
                 * Callback for "BeforeAdd" button
                 */
                _beforeAddRowData: function () {
                    var dt = this.s.dt;
                    
					this.onBeforeAddSubmitRow(this, dt.context[0], dt.context[0].sTableId);
					
					if (!altEditorFlags.preventAddSubmit)
						this._addRowData()
                },

                /**
                 * Callback for "BeforeAdd" button
                 */
                _beforeEditRowData: function () {
                    var dt = this.s.dt;
                    
					this.onBeforeEditSubmitRow(this, dt.context[0], dt.context[0].sTableId);
					
					if (!altEditorFlags.preventEditSubmit)
						this._editRowData();
                },

                /**
                 * Callback for "BeforeAdd" button
                 */
                _beforeDeleteRowData: function () {
                    var dt = this.s.dt;
                    
					this.onBeforeDeleteSubmitRow(this, dt.context[0], dt.context[0].sTableId);
					
					if (!altEditorFlags.preventDeleteSubmit)
						this._deleteRow();
                },

                /**
                 * Callback for "Add" button
                 */
                // _addRowData: function (tableID) {
                _addRowData: function () {
                    var that = this;
                    var dt = this.s.dt;

                    var rowDataArray = {};

                    // Getting the inputs from the modal
                    $('form[name="altEditor-add-form-' + this.random_id + '"] *').filter(':input[type!="file"]').each(function (i) {
                        rowDataArray[$(this).attr('id')] = $(this).val();
                    });

                    // Getting the selects from the modal
                    $('form[name="altEditor-add-form-' + this.random_id + '"] *').filter('select').each(function (i) {

                        var data = $(this).select2('data');
                        var multi = '';
						var wanted = $(this).attr("selectwanted");

                        for (var i = 0; i < data.length; i++) {
						  
							if (wanted == "id")
							{
								multi += data[i].id;
							}
							else
							{
								multi += data[i].text;
							}
						
                            multi = (i != (data.length - 1)) ? (multi + ", ") : multi;
                        }

                        rowDataArray[$(this).attr('id')] = multi;
                    });

                    //Getting the textArea from the modal
                    $('form[name="altEditor-add-form-' + this.random_id + '"] *').filter('textarea').each(function (i) {
                        rowDataArray[$(this).attr('id')] = $(this).val();
                    });

                    //Getting Files from the modal
                    var numFilesQueued = 0;
                    $('form[name="altEditor-add-form-' + this.random_id + '"] *').filter(':input[type="file"]').each(function (i) {
						var fileID = $(this).attr("id");
						var fileName = $(this).val().replace(/C:\\fakepath\\/i, '');
                       
						if ($(this).prop('files')[0]) {
							if (that.encodeFiles) {
                            ++numFilesQueued;
                            that.getBase64($(this).prop('files')[0], function (filecontent) {
								rowDataArray[fileID] = filecontent;
								rowDataArray[fileID + "label"] = fileName;
								rowDataArray["uploadtur"] = "base64";
								--numFilesQueued;
                            });
							} else {
								rowDataArray[fileID] = $(this).prop('files')[0];
								rowDataArray[fileID + "label"] = fileName;
								rowDataArray["uploadtur"] = "file";
							}
						}
						else {rowDataArray["uploadtur"] = "none"}
                    });

                    // Getting the checkbox from the modal
                    $('form[name="altEditor-add-form-' + this.random_id + '"] *').filter(':input[type="checkbox"]').each(function (i) {
                        rowDataArray[$(this).attr('id')] = this.checked;
                    });

                    var checkFilesQueued = function () {
                       if (numFilesQueued == 0) {
                           that.onAddRow(that,
                               rowDataArray,
                               function (data) { that._addRowCallback(data); },
                               function (data) { that._errorCallback(data); }
                           );
                       } else {
                           // console.log("Waiting for file base64-decoding...");
                           setTimeout(checkFilesQueued, 1000);
                       }
                    };

                    checkFilesQueued();
					
                    // console.log(rowDataArray); //DEBUG

                },

                /**
                 * Called after a row has been deleted on server
                 */
                _deleteRowCallback: function (response, status, more) {
                    var selector = this.modal_selector;
                    $(selector + ' .modal-body .alert').remove();

                    if (this.closeModalOnSuccess) {
                        this.internalCloseDialog(selector);
                    } else {
                        var message = '<div class="alert alert-success" role="alert">' +
                            '<strong>' + this.language.success + '</strong>' +
                            '</div>';
                        $(selector + ' .modal-body').append(message);
                    }

                    this.s.dt.row({
                        selected: true
                    }).remove();
                    this.s.dt.draw('page');

                    // Disabling submit button
                    $("div" + selector).find("button#addRowBtn").prop('disabled', true);
                    $("div" + selector).find("button#editRowBtn").prop('disabled', true);
                    $("div" + selector).find("button#deleteRowBtn").prop('disabled', true);
                },

                /**
                 * Called after a row has been inserted on server
                 */
                _addRowCallback: function (response, status, more) {

                    //TODO should honor dt.ajax().dataSrc

                    var data = (typeof response === "string") ? JSON.parse(response) : response;
                    var selector = this.modal_selector;
                    $(selector + ' .modal-body .alert').remove();

                    if (this.closeModalOnSuccess) {
                        this.internalCloseDialog(selector);
                    } else {
                        var message = '<div class="alert alert-success" role="alert">' +
                            '<strong>' + this.language.success + '</strong>' +
                            '</div>';
                        $(selector + ' .modal-body').append(message);
                    }

                    this.s.dt.row.add(data).draw(false);

                    // Disabling submit button
                    $("div" + selector).find("button#addRowBtn").prop('disabled', true);
                    $("div" + selector).find("button#editRowBtn").prop('disabled', true);
                    $("div" + selector).find("button#deleteRowBtn").prop('disabled', true);
                },

                /**
                 * Called after a row has been updated on server
                 */
                _editRowCallback: function (response, status, more) {

                    //TODO should honor dt.ajax().dataSrc

                    var data = (typeof response === "string") ? JSON.parse(response) : response;
                    var selector = this.modal_selector;
                    $(selector + ' .modal-body .alert').remove();

                    if (this.closeModalOnSuccess) {
                        this.internalCloseDialog(selector);
                    } else {
                        var message = '<div class="alert alert-success" role="alert">' +
                            '<strong>' + this.language.success + '</strong>' +
                            '</div>';
                        $(selector + ' .modal-body').append(message);
                    }

                    this.s.dt.row({
                        selected: true
                    }).data(data);
                    this.s.dt.draw('page');

                    // Disabling submit button
                    $("div" + selector).find("button#addRowBtn").prop('disabled', true);
                    $("div" + selector).find("button#editRowBtn").prop('disabled', true);
                    $("div" + selector).find("button#deleteRowBtn").prop('disabled', true);
                },

                /**
                 * Called after AJAX server returned an error
                 */
                _errorCallback: function (response, status, more) {
                    var error = response;
                    var selector = this.modal_selector;
                    $(selector + ' .modal-body .alert').remove();
                    var errstr = this.language.error.message;
                    if (error.responseJSON && error.responseJSON.errors) {
                        errstr = "";
                        for (var key in error.responseJSON.errors) {
                            errstr += error.responseJSON.errors[key][0];
                        }
                    }
                    var message = '<div class="alert alert-danger" role="alert">' +
                        '<strong>' + this.language.error.label + '</strong> ' + (error.status == null ? "" : this.language.error.responseCode + error.status) + " " + errstr +
                        '</div>';

                    $(selector + ' .modal-body').append(message);
                },
 

                /**
                 * Makes it a default function
                 */
				 
				 // Before modals open
                onBeforeAddRow: function (dt, rowdata, success, error) {
                     
                },
                onBeforeEditRow: function (dt, rowdata, success, error) {
                    
                },
                onBeforeDeleteRow: function (dt, rowdata, success, error) {
                     
                },
				
				 // After modals open
                onAfterAddRow: function (dt, rowdata, success, error) {
                     
                },
                onAfterEditRow: function (dt, rowdata, success, error) {
                    
                },
                onAfterDeleteRow: function (dt, rowdata, success, error) {
                     
                },

				// Modal submit buttons
                onBeforeAddSubmitRow: function (dt, rowdata, success, error) {
                     
                },
                onBeforeEditSubmitRow: function (dt, rowdata, success, error) {
                    
                },
                onBeforeDeleteSubmitRow: function (dt, rowdata, success, error) {
                     
                },

                /**
                 * Default callback for insertion: mock webservice, always success.
                 */
                onAddRow: function (dt, rowdata, success, error) {
                    console.log(rowdata)
                success(rowdata);
                },

                /**
                 * Default callback for editing: mock webservice, always success.
                 */
                onEditRow: function (dt, rowdata, success, error) {
					console.log(rowdata)
                success(rowdata);
                },

                /**
                 * Default callback for deletion: mock webservice, always success.
                 */
                onDeleteRow: function (dt, rowdata, success, error) {
                    console.log(rowdata)
                success(rowdata);
                },

                /**
                 * Open a dialog using available framework
                 */
                internalOpenDialog(selector, onopen) {
                    var $sel = $(selector);
                    if ($sel.modal) {
                        // Bootstrap
                        $sel.on('show.bs.modal', onopen);
                        $sel.modal('show');

                    } else if ($sel.foundation) {
                        // Foundation
                        $sel.on('open.zf.reveal', onopen);
                        $sel.on('closed.zf.reveal', function () { $('.reveal-overlay').hide(); });
                        var popup = new Foundation.Reveal($sel);
                        popup.open();

                    } else {
                        console.error('You must load Bootstrap or Foundation in order to open modal dialogs');
                        return;
                    }
                },

                /**
                 * Close a dialog using available framework
                 */
                internalCloseDialog(selector) {
                    var $sel = $(selector);
                    if ($sel.modal) {
                        // Bootstrap
                        $sel.modal('hide');

                    } else if ($sel.foundation) {
                        // Foundation
                        var popup = new Foundation.Reveal($sel);
                        popup.close();
                        $('.reveal-overlay').hide();

                    } else {
                        console.error('You must load Bootstrap or Foundation in order to open modal dialogs');
                        return;
                    }
                },

                /**
                 * Dinamically reload options in SELECT menu
                */
                reloadOptions: function ($select, options) {
                    var oldValue = $select.val();
                    $select.empty(); // remove old options
                    if (options.length > 0) {
                        // array-style select or select2
                        $.each(options, function (key, value) {
                            $select.append($("<option></option>")
                                .attr("value", value).text(value));
                        });
                    } else {
                        // object-style select or select2
                        $.each(options, function (key, value) {
                            $select.append($("<option></option>")
                                .attr("value", value).text(key));
                        });
                    }
                    $select.val(oldValue); // if still present, of course
                    $select.trigger('change');
                },

                /**
                 * Convert file to Base 64 form
                 * @see https://stackoverflow.com/questions/36280818
                 */
                getBase64: function (file, onSuccess, onError) {
                   var reader = new FileReader();
                   reader.readAsDataURL(file);
                   reader.onload = function () {
                       // console.log(reader.result);
                       if (onSuccess) onSuccess(reader.result);
                   };
                   reader.onerror = function (error) {
                       console.log('Error: ', error);
                       if (onError) onError(error);
                   };
                },

                /**
                 * Sanitizes input for use in HTML
                 * @param s
                 * @param preserveCR
                 * @returns {string}
                 * @private
                 */
                _quoteattr: function (s, preserveCR) {
                    if (s == null)
                        return "";
                    preserveCR = preserveCR ? '&#13;' : '\n';
                    if (Array.isArray(s)) {
                        // for MULTIPLE SELECT
                        var newArray = [];
                        var x;
                        for (x in s) newArray.push(s[x]);
                        return newArray;
                    }
                    return ('' + s) /* Forces the conversion to string. */
                        .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
                        .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
                        .replace(/"/g, '&quot;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
                        .replace(/[\r\n]/g, preserveCR);
                },
            });

        /**
         * altEditor version
         *
         * @static
         * @type String
         */
        altEditor.version = '2.0';

        /**
         * altEditor defaults
         *
         * @namespace
         */
        altEditor.defaults = {
            /**
             * @type {Boolean} Ask user what they want to do, even for a single
             * option
             */
            alwaysAsk: false,

            /** @type {string|null} What will trigger a focus */
            focus: null, // focus, click, hover

            /** @type {column-selector} Columns to provide auto fill for */
            columns: '', // all

            /** @type {boolean|null} Update the cells after a drag */
            update: null, // false is editor given, true otherwise

            /** @type {DataTable.Editor} Editor instance for automatic submission */
            editor: null
        };

        /**
         * Classes used by altEditor that are configurable
         *
         * @namespace
         */
        altEditor.classes = {
            /** @type {String} Class used by the selection button */
            btn: 'btn'
        };

        // Attach a listener to the document which listens for DataTables
        // initialisation
        // events so we can automatically initialise
        $(document).on('preInit.dt.altEditor', function (e, settings, json) {
            if (e.namespace !== 'dt') {
                return;
            }

            var init = settings.oInit.altEditor;
            var defaults = DataTable.defaults.altEditor;

            if (init || defaults) {
                var opts = $.extend({}, init, defaults);

                if (init !== false) {

                    var editor = new altEditor(settings, opts);
                    // e is a jQuery event object
                    // e.target is the underlying jQuery object, e.g. $('#mytable')
                    // so that you can retrieve the altEditor object later
                    e.target.altEditor = editor;
                }
            }
        });

        // Alias for access
        DataTable.altEditor = altEditor;
        return altEditor;
    });

}
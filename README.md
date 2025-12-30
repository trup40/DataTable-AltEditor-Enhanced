> [🇹🇷 Türkçe Oku](./README.tr.md)

# DataTable-AltEditor (Enhanced Edition)

**AltEditor** is a lightweight, modal-based CRUD (Create, Read, Update, Delete) extension for DataTables.

This **v3.0 Enhanced** version (modified by [Eagle](https://github.com/trup40)) significantly extends the original library with advanced lifecycle hooks, native Base64 file handling, inline form layouts, cleaner global control flags, and smarter select box management.

## 🚀 Key Features

* **Modal-Based Editing:** Adds "Add", "Edit", and "Delete" buttons to your DataTable.
* **Complete Lifecycle Hooks:** Intercept events before/after modals open and before/after data is submitted.
* **Inline Form Layout:** Display multiple input fields on the same row using the `inline: true` option.
* **Base64 File Support:** Automatically encodes file uploads to Base64 strings (`encodeFiles: true`).
* **Smart Selects:** Support for `select2`, automatic sorting, and value/text selection modes (`selectwanted`).
* **Global Control Object:** Easily prevent modals or submissions programmatically via `altEditorFlags`.
* **Integrations:** Supports Bootstrap 3/4/5, Foundation, Select2, Bootstrap-Datepicker, and jQuery UI Datepicker.

## 📦 Prerequisites

Ensure the following libraries are loaded in your project:

* jQuery
* DataTables (with Buttons extension)
* Bootstrap (JS/CSS) or Foundation
* *Optional:* Select2, Moment.js, Bootstrap-Datepicker

## ⚙️ Initialization & Configuration

Enable AltEditor by adding `altEditor: true` (or a config object) to your DataTables initialization.

### 1. Global Settings

These settings control the overall behavior of the editor within the DataTables definition.

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `altEditor` | `boolean` | `false` | Enables the AltEditor extension. |
| `encodeFiles` | `boolean` | `false` | **[New]** If `true`, file inputs are automatically converted to Base64 strings before submission. |
| `closeModalOnSuccess` | `boolean` | `true` | If `true`, the modal closes automatically after a successful AJAX response. |
| `altEditorDelButtons` | `array` | `[]` | A list of default button names to remove/hide (e.g. if you want to use custom buttons). |

### 2. Column Configuration (`columns`)

Configuration for input fields inside the modal, defined within the standard DataTables `columns` array.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `data` (or `name`) | `string` | The data source key from the row object. |
| `title` | `string` | Label text for the input field. Defaults to column header. |
| `type` | `string` | Input type: `text`, `select`, `hidden`, `textarea`, `file`, `checkbox`, `number`, `readonly`, `date`. |
| `inline` | `boolean` | **[New]** If `true`, this field is placed on the same row as the next field (Side-by-side). |
| `selectwanted` | `string` | **[New]** For `select` types. `'id'` sends the value; `'text'` sends the displayed text. |
| `optionsSortByLabel` | `boolean` | **[New]** For `select` types. If `true`, options are sorted alphabetically by label. |
| `bootstrapdatepicker` | `object` | **[New]** Configuration object for `bootstrap-datepicker`. |
| `options` | `array` | Data for `select`. formats: `['A','B']` or `[{id:1, text:'A'}]` or `[{id:null, text:'Group', children:[...]}]`. |
| `select2` | `object` | Configuration object for Select2 (e.g., `{ width: '100%' }`). |
| `datepicker` | `object` | Configuration for jQuery UI Datepicker. |
| `datetimepicker` | `object` | Configuration for Datetimepicker. |
| `required` | `boolean` | Adds `required` attribute. |
| `readonly` | `boolean` | Adds `readonly` attribute. |
| `disabled` | `boolean` | Adds `disabled` attribute. |
| `placeholder` | `string` | Placeholder text. |
| `unique` | `boolean` | Client-side check to ensure the value doesn't already exist in the table. |
| `rows` | `number` | Height (rows) for `textarea`. Default: 5. |
| `cols` | `number` | Width (cols) for `textarea`. Default: 30. |
| `min` | `number` | Min value for `number` inputs. |
| `max` | `number` | Max value for `number` inputs. |
| `step` | `number` | Step value for `number` inputs. |
| `maxsize` | `number` | Max file size for `file` inputs. |
| `accept` | `number` | Accepted file types for `file` inputs. |
| `maxLength` | `number` | Max character length for inputs. |
| `pattern` | `string` | Regex pattern for validation. Default: `.*` |
| `style` | `string` | Inline CSS styles for the input. |
| `hoverMsg` | `string` | Tooltip text on hover. |
| `msg` | `string` | Error message text (legacy). |
| `uniqueMsg` | `string` | Error message for uniqueness violation (legacy). |
| `special` | `string` | Internal use flag. |
| `editorOnChange` | `function` | Custom callback triggered on input change: `function(event, altEditorInstance)`. |

### 3. Lifecycle Hooks (Events)

You can intercept the process at various stages. Define these functions in your DataTables config.

#### Modal Opening Hooks

| Hook | Description |
| :--- | :--- |
| `onBeforeAddRow(dt, row, success, error)` | Triggered **before** the Add Modal opens. |
| `onBeforeEditRow(dt, row, success, error)` | Triggered **before** the Edit Modal opens. |
| `onBeforeDeleteRow(dt, row, success, error)` | Triggered **before** the Delete Modal opens. |
| `onAfterAddRow(dt, row, success, error)` | Triggered **after** the Add Modal is shown (DOM ready). |
| `onAfterEditRow(dt, row, success, error)` | Triggered **after** the Edit Modal is shown. |
| `onAfterDeleteRow(dt, row, success, error)` | Triggered **after** the Delete Modal is shown. |

#### Submission Hooks (Validation)

These are ideal for client-side validation before sending data to the server.

| Hook | Description |
| :--- | :--- |
| `onBeforeAddSubmitRow(dt, row, success, error)` | Triggered when "Add" button is clicked, **before** server request. |
| `onBeforeEditSubmitRow(dt, row, success, error)` | Triggered when "Edit" button is clicked, **before** server request. |
| `onBeforeDeleteSubmitRow(dt, row, success, error)` | Triggered when "Delete" button is clicked, **before** server request. |

#### Server Action Callbacks

Handle the actual AJAX requests here.

| Callback | Description |
| :--- | :--- |
| `onAddRow(dt, rowdata, success, error)` | Perform the API call to **create** a record. |
| `onEditRow(dt, rowdata, success, error)` | Perform the API call to **update** a record. |
| `onDeleteRow(dt, rowdata, success, error)` | Perform the API call to **delete** a record. |

### 4. Global Control Flags

You can control the editor behavior programmatically using the global `altEditorFlags` object. This is useful for conditional logic (e.g., preventing a modal from opening based on external state).

| Property | Default | Description |
| :--- | :--- | :--- |
| `altEditorFlags.preventAddModal` | `false` | If `true`, prevents the **Add Modal** from opening. |
| `altEditorFlags.preventEditModal` | `false` | If `true`, prevents the **Edit Modal** from opening. |
| `altEditorFlags.preventDeleteModal` | `false` | If `true`, prevents the **Delete Modal** from opening. |
| `altEditorFlags.preventAddSubmit` | `false` | If `true`, prevents the **Add Form** from submitting (keeps modal open). |
| `altEditorFlags.preventEditSubmit` | `false` | If `true`, prevents the **Edit Form** from submitting (keeps modal open). |
| `altEditorFlags.preventDeleteSubmit`| `false` | If `true`, prevents the **Delete Form** from submitting (keeps modal open). |

## 💻 Comprehensive Example

```javascript
$(document).ready(function() {
    $('#example').DataTable({
        dom: 'Bfrtip',
        ajax: { url: './data.json', dataSrc: 'data' },
        
        // --- Global AltEditor Settings ---
        altEditor: true,
        encodeFiles: true,     // Convert uploads to Base64
        closeModalOnSuccess: true, 
        
        // --- Buttons ---
        buttons: [
            { text: 'Add', name: 'add' },
            { extend: 'selected', text: 'Edit', name: 'edit' },
            { extend: 'selected', text: 'Delete', name: 'delete' },
            { text: 'Refresh', name: 'refresh' }
        ],

        // --- Column Definitions ---
        columns: [
            { 
                data: 'id', title: 'ID', type: 'readonly' 
            },
            { 
                data: 'name', title: 'Name', type: 'text', required: true,
                inline: true // Places "Name" and "Surname" on the same row
            },
            { 
                data: 'surname', title: 'Surname', type: 'text', required: true,
                inline: true 
            },
            { 
                data: 'role', title: 'User Role', type: 'select',
                options: [{id: '1', text: 'Admin'}, {id: '2', text: 'User'}],
                selectwanted: 'id', // Send '1' or '2'
                optionsSortByLabel: true,
                select2: { width: '100%' }
            },
            { 
                data: 'dob', title: 'Date of Birth', type: 'text',
                bootstrapdatepicker: { format: 'dd.mm.yyyy', autoclose: true }
            },
            { 
                data: 'avatar', title: 'Avatar', type: 'file',
                accept: 'image/png, image/jpeg'
            }
        ],

        // --- Hooks & Callbacks ---
        
        // 1. Example: Prevent opening Edit modal for "Admin" users
        onBeforeEditRow: function(dt, rowdata, success, error) {
            if (rowdata.role === '1') { // 1 = Admin
                 alert("You cannot edit Admin records.");
                 // You can use the flag to stop the modal:
                 altEditorFlags.preventEditModal = true; 
            } else {
                 altEditorFlags.preventEditModal = false;
            }
        },

        // 2. Validate before submitting to server
        onBeforeAddSubmitRow: function(dt, rowdata, success, error) {
            if (rowdata.name.length < 3) {
                alert('Name is too short!');
                return; // Abort submission
            }
            success(); // Proceed
        },

        // 3. Handle Server Actions
        onAddRow: function(dt, rowdata, success, error) {
            // rowdata.avatar is now a Base64 string due to encodeFiles:true
            console.log("Adding:", rowdata);
            
            // Simulate AJAX
            setTimeout(function() { success(rowdata); }, 500); 
        },
        onEditRow: function(dt, rowdata, success, error) {
            console.log("Editing:", rowdata);
            success(rowdata);
        },
        onDeleteRow: function(dt, rowdata, success, error) {
            console.log("Deleting:", rowdata);
            success(rowdata);
        }
    });
});
```

## 📝 Credits & License
* Original Author: Kingkode
* Contributors: KasperOlesen, Luca Vercelli, Zack Hable
* Enhanced Version: Eagle (trup40)
* License: MIT
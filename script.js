// Event Listener Registration
document.addEventListener("DOMContentLoaded", function () {
    // DOM Element Selection
    const addNoteBtn = document.getElementById("add-note-btn");
    const addNoteFormContainer = document.getElementById("add-note-form-container");
    const addNoteForm = document.getElementById("add-note-form");
    const displayedNotesContainer = document.getElementById("displayed-notes-container");
    const noteTitleInput = document.getElementById("add-note-title");
    const searchNotesInput = document.getElementById("search-notes-input");
    const searchNotesBtn = document.getElementById("search-notes-btn");
    const sortOptionsSelect = document.getElementById("sort-options");
    const cancelNoteBtn = document.getElementById("cancel-note-btn");
    const saveNoteBtn = document.getElementById("save-note-btn");
    const emptyTitleMessage = document.getElementById("empty-title-message");
    const emptyContentMessage = document.getElementById("empty-content-message");
    const fileUploadInput = document.getElementById("file-upload");

    // CKEditor Integration
    const editor = CKEDITOR.replace('editor-container', {
        height: 200,
        removePlugins: 'resize'
    });

    // Load Notes from Local Storage
    loadNotesFromLocalStorage();

    // Add Note Button Click Event
    addNoteBtn.addEventListener("click", function () {
        addNoteFormContainer.classList.remove("hidden");
        editingNote = null;
        editor.setData('');
    });

    // Add Note Form Submission Event
    addNoteForm.addEventListener("submit", function (event) {
        event.preventDefault();
        // Extract Note Title and Content
        const newNoteTitle = noteTitleInput.value.trim();
        const newNoteContent = CKEDITOR.instances['editor-container'].getData().trim();

        // Validate Note Title and Content
        if (newNoteTitle === '') {
            emptyTitleMessage.classList.remove("hidden");
            return;
        } else {
            emptyTitleMessage.classList.add("hidden");
        }

        if (newNoteContent === '') {
            emptyContentMessage.classList.remove("hidden");
            return;
        } else {
            emptyContentMessage.classList.add("hidden");
        }

        // Create New Note Object
        const newNoteCreatedAt = new Date().toLocaleString();
        const newNote = {
            id: editingNote ? editingNote.id : Date.now(),
            title: newNoteTitle,
            content: newNoteContent,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Update or Add Note
        if (editingNote) {
            editingNote.title = newNoteTitle;
            editingNote.content = newNoteContent;
            editingNote.updatedAt = new Date();
            updateNoteInDOM(editingNote);
        } else {
            notes.push(newNote);
            saveNotesToLocalStorage();
            displayedNotesContainer.appendChild(createNoteContainer(newNote));
        }

        // File Upload Handling
        const files = fileUploadInput.files;
        for (let i = 0; i < files.length; i++) {
            console.log("Uploaded file:", files[i].name);
        }

        // Reset Add Note Form
        addNoteForm.reset();
        addNoteFormContainer.classList.add("hidden");
        editingNote = null;
    });

    // Cancel Note Button Click Event
    cancelNoteBtn.addEventListener("click", function () {
        addNoteForm.reset();
        addNoteFormContainer.classList.add("hidden");
        editingNote = null;
        console.log("Cancel button clicked");
    });

    // Save Note Button Click Event
    saveNoteBtn.addEventListener("click", function () {
        console.log("Save button clicked");
    });

    // Search Notes Button Click Event
    searchNotesBtn.addEventListener("click", function () {
        // Extract Search Keyword
        const keyword = searchNotesInput.value.trim().toLowerCase();

        // Remove Existing Highlights
        removeHighlights();

        if (keyword === '') return;

        // Search Notes and Highlight Keywords
        notes.forEach(note => {
            const noteContainer = document.querySelector(`.note-container[data-id="${note.id}"]`);
            if (note.title.toLowerCase().includes(keyword)) {
                highlightKeyword(noteContainer.querySelector("h2"), keyword);
            }
            if (note.content.toLowerCase().includes(keyword)) {
                highlightKeyword(noteContainer.querySelector("div"), keyword);
            }
        });
    });

    // Sort Options Select Change Event
    sortOptionsSelect.addEventListener("change", function () {
        // Module: Sort Notes
        const sortBy = sortOptionsSelect.value;
        sortNotes(sortBy);
    });

    // Sort Notes by Criteria
    function sortNotes(sortBy) {
        // Switch Sort Criteria
        switch (sortBy) {
            case "title":
                notes.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case "date-oldest":
                notes.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                break;
            case "date-latest":
                notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                break;
            default:
                break;
        }

        // Refresh Displayed Notes
        displayedNotesContainer.innerHTML = '';

        notes.forEach(note => {
            displayedNotesContainer.appendChild(createNoteContainer(note));
        });
    }

    // Highlight Keyword in Element
    function highlightKeyword(element, keyword) {
        const innerHTML = element.innerHTML;
        const regex = new RegExp(`(${keyword})`, "gi");
        const newInnerHTML = innerHTML.replace(regex, '<span class="highlighted" style="background-color: yellow;">$1</span>');
        element.innerHTML = newInnerHTML;
    }

    // Create Note Container
    function createNoteContainer(note) {
        // Create HTML Elements for Note Display
        const noteContainer = document.createElement("div");
        noteContainer.classList.add("note-container");
        noteContainer.dataset.id = note.id;

        const title = document.createElement("h2");
        title.textContent = note.title;

        const content = document.createElement("div");
        content.innerHTML = note.content;

        const dates = document.createElement("div");
        dates.classList.add("dates");
        dates.textContent = `Created: ${note.createdAt.toLocaleString()}, Last Updated: ${note.updatedAt.toLocaleString()}`;

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("edit-btn");
        editBtn.addEventListener("click", function () {
            handleEdit(note);
            console.log("Edit button clicked");
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("delete-btn");
        deleteBtn.addEventListener("click", function () {
            handleDelete(noteContainer, note);
            console.log("Delete button clicked");
        });

        noteContainer.appendChild(title);
        noteContainer.appendChild(content);
        noteContainer.appendChild(dates);
        noteContainer.appendChild(editBtn);
        noteContainer.appendChild(deleteBtn);

        return noteContainer;
    }

    // Update Note in DOM
    function updateNoteInDOM(note) {
        const noteContainer = document.querySelector(`.note-container[data-id="${note.id}"]`);
        if (noteContainer) {
            const title = noteContainer.querySelector("h2");
            const content = noteContainer.querySelector("div");
            const dates = noteContainer.querySelector(".dates");

            title.textContent = note.title;
            content.innerHTML = note.content;
            dates.textContent = `Created: ${note.createdAt.toLocaleString()}, Last Updated: ${note.updatedAt.toLocaleString()}`;
        }
        saveNotesToLocalStorage();
    }

    // Handle Edit Note
    function handleEdit(note) {
        editingNote = note;
        noteTitleInput.value = note.title;
        CKEDITOR.instances['editor-container'].setData(note.content);
        addNoteFormContainer.classList.remove("hidden");
    }

    // Handle Delete Note
    function handleDelete(noteContainer, note) {
        const index = notes.findIndex(n => n.id === note.id);
        if (index !== -1) {
            notes.splice(index, 1);
            noteContainer.remove();
            saveNotesToLocalStorage();
        }
    }

    // Save Notes to Local Storage
    function saveNotesToLocalStorage() {
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    // Load Notes from Local Storage
    function loadNotesFromLocalStorage() {
        const storedNotes = localStorage.getItem("notes");
        if (storedNotes) {
            notes = JSON.parse(storedNotes);
            notes.forEach(note => {
                displayedNotesContainer.appendChild(createNoteContainer(note));
            });
        }
    }

    // Remove Highlights from Notes
    function removeHighlights() {
        const highlightedElements = displayedNotesContainer.querySelectorAll('.highlighted');
        highlightedElements.forEach(span => {
            span.outerHTML = span.innerHTML;
        });
    }
});

document.addEventListener("DOMContentLoaded", function () {
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
    let editingNote = null;
    let notes = [];

    // Load CKEditor library
    const editor = CKEDITOR.replace('editor-container', {
        height: 200,
        removePlugins: 'resize'
    });

    // Load notes from local storage when the page loads
    loadNotesFromLocalStorage();

    addNoteBtn.addEventListener("click", function () {
        addNoteFormContainer.classList.remove("hidden");
        editingNote = null;
        editor.setData('');
        emptyContentMessage.classList.add("hidden");
        emptyTitleMessage.classList.add("hidden");
    });

    addNoteForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const newNoteTitle = noteTitleInput.value.trim();
        const newNoteContent = CKEDITOR.instances['editor-container'].getData().trim();

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

        const newNoteCreatedAt = new Date().toLocaleString();
        const newNote = {
            id: editingNote ? editingNote.id : Date.now(),
            title: newNoteTitle,
            content: newNoteContent,
            createdAt: new Date(),
            updatedAt: new Date()
        };

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

        const files = fileUploadInput.files;
        for (let i = 0; i < files.length; i++) {
            console.log("Uploaded file:", files[i].name);
        }

        addNoteForm.reset();
        addNoteFormContainer.classList.add("hidden");
        editingNote = null;
    });

    cancelNoteBtn.addEventListener("click", function () {
        addNoteForm.reset();
        addNoteFormContainer.classList.add("hidden");
        editingNote = null;
        console.log("Cancel button clicked");
    });

    saveNoteBtn.addEventListener("click", function () {
        console.log("Save button clicked");
    });

    searchNotesBtn.addEventListener("click", function () {
        const keyword = searchNotesInput.value.trim().toLowerCase();

        removeHighlights();

        if (keyword === '') return;

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

    sortOptionsSelect.addEventListener("change", function () {
        const sortBy = sortOptionsSelect.value;
        sortNotes(sortBy);
    });

    function sortNotes(sortBy) {
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

        displayedNotesContainer.innerHTML = '';

        notes.forEach(note => {
            displayedNotesContainer.appendChild(createNoteContainer(note));
        });
    }

    function highlightKeyword(element, keyword) {
        const innerHTML = element.innerHTML;
        const regex = new RegExp(`(${keyword})`, "gi");
        const newInnerHTML = innerHTML.replace(regex, '<span class="highlighted" style="background-color: yellow;">$1</span>');
        element.innerHTML = newInnerHTML;
    }

    function createNoteContainer(note) {
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

    function handleEdit(note) {
        editingNote = note;
        noteTitleInput.value = note.title;
        CKEDITOR.instances['editor-container'].setData(note.content);
        addNoteFormContainer.classList.remove("hidden");
    }

    function handleDelete(noteContainer, note) {
        const index = notes.findIndex(n => n.id === note.id);
        if (index !== -1) {
            notes.splice(index, 1);
            noteContainer.remove();
            saveNotesToLocalStorage();
        }
    }

    function saveNotesToLocalStorage() {
        localStorage.setItem("notes", JSON.stringify(notes));
    }

    function loadNotesFromLocalStorage() {
        const storedNotes = localStorage.getItem("notes");
        if (storedNotes) {
            notes = JSON.parse(storedNotes);
            notes.forEach(note => {
                displayedNotesContainer.appendChild(createNoteContainer(note));
            });
        }
    }

    function removeHighlights() {
        const highlightedElements = displayedNotesContainer.querySelectorAll('.highlighted');
        highlightedElements.forEach(span => {
            span.outerHTML = span.innerHTML;
        });
    }
});

//LOGIN CHECK. Redirect on false
//isUserLoggedInRedirect();

async function apiGetTodos() {
    try {
        const response = await fetch(apiUrlTodo, { method: "GET" })
        if(response.ok) {
            return await response.json();
        }
        else {
            const data = await response.json();
            return { status: response.status, serverErrMsg: data.error}
        }
    }
    catch(err) {
        return {error : err.message};
    }
}

async function getUserTodos() { //returns all ToDos by current user
    const todos = await apiGetTodos();
    if(todos.error) {   //catch error
        //klaida bla bla error.message
    }
    if(todos.status) {  //!response.ok
        //klaida bla bla serverErrMsg || kazka + todos.status
    }
    console.log(todos);
    
    //filter todos that belong to current user
    //if(userId) - VALIDATE
    const userId = getCurrentUserId();    //loginCheck.js userId or null
    const todosByUserId = todos.filter(obj => {
        return obj.userId === userId;
    });

    console.log(todosByUserId);
    return todosByUserId;
}

async function apiCreateTodo(todoObj) { //TODO server error code handling
    try {
        const response = await fetch(apiUrlTodo, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(todoObj)
        })

        if(response.ok) {
            return response.json();
        } else {
            const data = response.json();
            return { error: data.error || `Network or unexpected error. Code: ${response.status}`};
        }
    }
    catch(err) {
        return { error: err.message };
    }
}

async function createTodo() {
    //validate if user is logged in again?
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if(currentUser && currentUser.userName && currentUser.id) { //KINDA DOUBLECHEK, nes turetume loginCheck pasitikrint
        
    } else {
        alert("Corrupted user data! Try logging out and in");
        document.location.href = indexUrl;
    }

    //VALIDACIJOS CIA:
    //Check for past date!!!!
    newTodoHeading.innerText="New ToDo note";
    const endDateFromInput = getIsoDateTimeFromElem(dateTimeInput);
    if(endDateFromInput) {
        const newTodoObj = {
            userId: currentUser.id,
            type: todoCategory.value,
            content: todoContent.value,
            endDate: endDateFromInput,
            priority: todoPrioritySelector.value
        }
        apiCreateTodo(newTodoObj);
        //close popup form
        todoPopup.style.display = "none";
        //refresh todos
        displayTodos();
        console.log(newTodoObj);        //TEST!!!!!!!!!!!!!
    }
    else {
        //TEST, laikina VISAS VERIFICATION
        alert("Bad time format?");
    }
    //error handlinimas reikalingas cia
    
}

//logout button
logOutButton.addEventListener("click", userLogOut); //loginCheck.js

//submit new todo
//submitTodoBtn.addEventListener("click", createTodo);
todoPopupNewForm.addEventListener("submit", createTodo);

//submit edited todo
//todoPopupNewFormEdit

function getIsoDateTimeFromElem(elem) {
    const dateTimeFromElement = elem.value;
    if(dateTimeFromElement) {
        const dateObj = new Date(dateTimeFromElement + "Z"); // + "Z" - UTC time zone, gal galima gaut local time zone?
        const dateTimeISO = dateObj.toISOString();
        return dateTimeISO;

    } else {
        return false;
    }
}

//compare with Date.Now().getTime();
// const todayMs = todayAtMidnight.getTime() // Returns 1703221200000 ms
// const payloadMs = payloadToLocalDate.getTime() // Returns 1703307600000 ms

function getDateTimeFromIso(dateTimeIso) {
    if(!dateTimeIso) {
        return '-';
    }
    const dtSplit = dateTimeIso.split("-");
    const tSplit = dateTimeIso.split("T")[1].split(":")

    const newDate = new Date(
        dtSplit[0],
        dtSplit[1],
        dtSplit[2].split('T')[0],
        tSplit[0],
        tSplit[1],
        tSplit[2],
        0
    )

    return `${newDate.toLocaleDateString()}<br>${newDate.toLocaleTimeString()}`;

}

function popupDiscard() {
    todoPopup.style.display = "none";
    newTodoHeading.innerText = "New ToDo note";
    todoFormMsg.innerText ="";
    todoPopupNewForm.reset();
}
discardTodoBtn.addEventListener("click", popupDiscard);

function popupDiscardEdit() {
    todoPopupEdit.style.display = "none";
    newTodoHeadingEdit.innerText = "New ToDo note";
    todoFormMsgEdit.innerText ="";
    todoPopupNewFormEdit.reset();
}
discardTodoBtnEdit.addEventListener("click", popupDiscardEdit);

function popupDisplay() {
    todoPopup.style.display = "block";
    todoPopupEdit.style.display = "none";
}
openTodoPopup.addEventListener("click", popupDisplay);

function popupDisplayEdit() {
    todoPopupEdit.style.display = "block";
    todoPopup.style.display = "none";
}


//iframeElement.onload - neveikia su google chrome :)
async function displayTodos() {
    //Set <head> of iFrame
    const iFrameDoc = todosFrame.contentWindow.document;
    iFrameDoc.location.href="about:blank";  //reset iframe element
    iFrameDoc.open();
    iFrameDoc.write(`
        <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>ToDos Content</title>
        <meta name="description" content="">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="styles/todos.css">
        </head>`);
    //pakeist css faila !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    iFrameDoc.close();
    
    //Set <body> of iFrame
    iFrameDoc.body.innerHTML = "<div id='todosContent' class='todosContent'></div>";
    const todosContent = todosFrame.contentWindow.document.getElementById("todosContent");
    const todos = await getUserTodos(); //load todos from API
    //typeof data === 'object' && Object.keys(data).length === 0
    //if(!todos || todos.lenght === 0)
    if(typeof(todos) === "object" && Object.keys(todos).length === 0) {
        //alert("NO TODOS FOUND!") //TEST!!!!! ERROR AREA REIKIA SUKURTI!!!!
        //EMPTY TODO

        //class="todosTable" = todosTableEmpty - sukurt css
        todosContent.innerHTML += `
            <table class="todosTable">
                <tr>
                   <td>You don't have any ToDo notes.</td>
                <tr>
            </table>
            `;

    } else {

        for(let todo of todos) {    //cia vykt turetu elementu rusiavimas pagal priority tipa ir completed
            todosContent.innerHTML += `
            <table class="todosTable" id="todoItem${todo.id}">
                <tr>
                    <td class="todoTopRowTd"><strong>${todo.type}</strong></td>
                    <td class="todoTopRowTd"><strong>${priorityNumToText(todo.priority)}</strong></td>
                    <td class="todoTopRowTd"><strong>${getDateTimeFromIso(todo.endDate) || '-'}</strong></td>
                    <td class="spacerTd"></td>
                    <td></td>
                </tr>

                <tr>
                    <td colspan="4" rowspan="3" class="todoContentText">${todo.content}</td>
                    <td><input type="button" value="Edit" class="todoBtn" id="todoEditBtn${todo.id}"></td>
                </tr>

                <tr>
                    <td><input type="button" value="Delete" class="todoBtn" id="todoDeleteBtn${todo.id}"></td>
                </tr>

                <tr>
                    <td><input type="button" value="Complete" class="todoBtn" id="todoCompleteBtn${todo.id}"></td>
                </tr>
            </table>
            `;
            //iFrameDoc.getElementById(`todoDeleteBtn${todo.id}) - niekaip nesutiko pridet event listener
            todosContent.addEventListener('click', async (event) => {
                if (event.target && event.target.matches(`[id^='todoDeleteBtn${todo.id}']`)) {
                    const todoObj = await getTodoById(todo.id);
                    if(todoObj.id) {
                        //delete
                        deleteTodoById(todoObj.id);
                    } else {
                        alert("Todo not found by id!");
                        //errorrrr!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    }
                }
            });

            //ToDo note Edit
            todosContent.addEventListener('click', async (event) => {
                if (event.target && event.target.matches(`[id^='todoEditBtn${todo.id}']`)) {
                    const todoObj = await getTodoById(todo.id);
                    if(todoObj.id) {
                        //edit
                        //deleteTodoById(todoObj.id);
                        updatePopupTodoEditById(todoObj.id);
                    } else {
                        alert("Todo not found by id!");
                        //errorrrr!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    }
                }
            });

        }
    }
}
function priorityNumToText(priorityNumber) {
    switch(priorityNumber) {
        case 1: return "Not very important";
        case 2: return "Somewhat important";
        case 3: return "Important";
        case 4: return "Very important";
        case 5: return "Do or die trying!";
        default: return "-";
    }
}

async function apiGetTodoById(todoId) {
    //IF TODO ID
    const fetchUrlStr = `${apiUrlTodo}/${todoId}`;
    try {
        const response = await fetch(fetchUrlStr, { method: "GET" });
        if(response.ok) {
            return await response.json();
        }
        else {
            const data = await response.json();     //for server error msg
            return {status: response.status, serverErrMsg: data.error};
        }
    }
    catch(err) {
        return { error: err}; 
    }
}

async function getTodoById(todoId) {
    const todoData = await apiGetTodoById(todoId);

    if(todoData.error) {    //catch error
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! output nera!!!!!!!

        //setLoginStatusMsg(`Connection error. Please try again later. ${todoData.error.message}`);
        console.log(`Connection error. Please try again later. ${todoData.error.message}`);
        return null;
    } 
    
    if(todoData.status) {   //!response.ok
        //setLoginStatusMsg(userData.serverErrMsg || `Unable to log in. Please try again later. Error: ${userData.status}`);
        console.log(todoData.serverErrMsg || `Unable to log in. Please try again later. Error: ${userData.status}`)
        return null;
    }
    //console.log("TODO id: " + todoData.id + todoData);               //TEST    
    return todoData;
}

async function apiDeleteTodoById(todoId) {
    //IF TODO ID
    const fetchUrlStr = `${apiUrlTodo}/${todoId}`;
    try {
        const response = await fetch(fetchUrlStr, { method: "DELETE" });
        if(response.status === 204) {   //204 - no content on succesful deletion
            const iFrameDoc = todosFrame.contentWindow.document;
            iFrameDoc.getElementById(`todoItem${todoId}`).remove();
            return { error: null, status: 204};
            //return await response.json();
        }
        else {
            const data = await response.json();     //for server error msg
            return {status: response.status, serverErrMsg: data.error};
        }
    }
    catch(err) {
        alert("Catch err: " + err.message);     ///testtttt
        return { error: err}; 
    }
}

async function deleteTodoById(todoId) { 
    const todoData = await apiDeleteTodoById(todoId);

    if(todoData.error) {    //catch error
        //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! output nera!!!!!!!

        //setLoginStatusMsg(`Connection error. Please try again later. ${todoData.error.message}`);
        console.log(`Connection error. Please try again later. ${todoData.error.message}`);
        return null;
    } 
    
    if(todoData.status) {   //expecting 204
        //setLoginStatusMsg(userData.serverErrMsg || `Unable to log in. Please try again later. Error: ${userData.status}`);
        console.log(todoData?.serverErrMsg || `Unable to log in. Please try again later. Error: ${userData.status}`)    //CIA NESAMONE DELETE USER DATA NEEGZISTUOJA
        return null;
    }
    console.log("TODO deletion id: " + todoData.id + todoData);               //TEST    
    return;
}

async function updatePopupTodoEditById(todoId) {
    if(todoId) {
        const todo =  await getTodoById(todoId);
        if(todo) {
            console.log(todo);              //TEST
            //Set popup content
            newTodoHeadingEdit.innerText="Edit ToDo Note";
            todoFormMsgEdit.innerText ="";
            todoCategoryEdit.value = todo.type;
            todoPrioritySelectorEdit.value = todo.priority;
            dateTimeInputEdit.value = todo.endDate; //neteisingai rodo data - viena diena maziau
            todoContentEdit.value = todo.content;
            // todoPopupEdit.style.display = "block";
            // todoPopup.style.display = "none";

            //set form submit event to update ir taip pat create nustatyt
            popupDisplayEdit();

        } else {
            alert(`Todo not found! ${todoId}`);
        }
    }
}

async function updateTodoById(todoId) {
    const todoData = await getTodoById(todoId);

    //validate if user is logged?
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if(currentUser && currentUser.userName && currentUser.id) {
    
    } else {
        alert("Corrupted user data! Try logging out and in");
        document.location.href = indexUrl;
    }

    //Check for past date!!!!
    const endDateFromInput = getIsoDateTimeFromElem(dateTimeInput);
    if(endDateFromInput) {
        const newTodoObj = {
            userId: currentUser.id,
            type: todoCategoryEdit.value,
            content: todoContentEdit.value,
            endDate: endDateFromInputEdit,
            priority: todoPrioritySelectorEdit.value
        }

        const response = apiUpdateTodo(newTodoObj); //validacijo

        //close popup form
        todoPopup.style.display = "none";

        //refresh todos
        displayTodos();
        console.log(newTodoObj);        //TEST!!!!!!!!!!!!!
    }
    else {
        //TEST, laikina VISAS VERIFICATION
        alert("Bad time format?");
    }
}

async function apiUpdateTodo(todoObj) {
    try {
        const response = await fetch(apiUrlTodo, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(todoObj)
        })

        if(response.ok) {
            return response.json();
        } else {
            const data = response.json();
            return { error: data.error || `Network or unexpected error. Code: ${response.status}`};
        }
    }
    catch(err) {
        return { error: err.message };
    }
}

document.onload = displayTodos();





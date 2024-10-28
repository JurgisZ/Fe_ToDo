//login checks, user checks
function isUserLoggedInRedirect() {
    const currentUser= JSON.parse(localStorage.getItem("currentUser"));    //pamastymui: delete user Api nera, bet jei butu, kaip neleist useriui kuris istrintas is Db, bet ne is local storage naudotis svetaine?
    if(currentUser && currentUser.id && currentUser.userName)
    {
        document.location.href = todosUrl;
    }
}

function getCurrentUserId() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if(!currentUser && currentUser.id)
        return null;
    return currentUser.id;
}

function userLogOut() {
    localStorage.removeItem("currentUser");
    document.location = indexUrl;
}
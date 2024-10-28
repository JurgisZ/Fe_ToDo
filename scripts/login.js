const loginStatusMsgElement = loginStatusText;  //element to display status messages, innerText

//document.onload = isUserLoggedInRedirect; //if user data is in session storage, redirect to ToDo page

//window.addEventListener("load", isUserLoggedInRedirect);
window.onload = isUserLoggedInRedirect;

//registration button:
registerBtn.addEventListener("click", () => {location.href = registrationUrl})


async function apiAuthenticateUser(loginUserName, loginUserPass) {   //returns user data or object with error prop
    
    const fetchUrlParams = new URLSearchParams({
        userName: loginUserName,
        password: loginUserPass
    });
    
    const fetchUrlStr = `${apiUrlAuth}?${fetchUrlParams.toString()}`;
    
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

async function attemptLogin() {
    const loginUserName = userNameField.value;
    const loginUserPass = userPasswordField.value;
    const userData = await apiAuthenticateUser(loginUserName, loginUserPass);

    if(userData.error) {    //catch error
        setLoginStatusMsg(`Connection error. Please try again later. ${userData.error.message}`);
        return;
    } 
    
    if(userData.status) {   //!response.ok
        setLoginStatusMsg(userData.serverErrMsg || `Unable to log in. Please try again later. Error: ${userData.status}`);
        return;
    }

    console.log("Sekmingai prisijungta!");  //TEST
    console.log(userData.userName);         //TEST
    console.log(userData.id);               //TEST

    localStorage.setItem("currentUser", JSON.stringify({
        userName: userData.userName,
        id: userData.id
    }));
    setLoginStatusMsg(`Welcome ${userData.userName}`, false);   //vis dar rodo please login. Gal vietoj sito reiktu?
    //timeout and redirect
    document.location = todosUrl;
}

// submitLogin.addEventListener("submit", attemptLogin);    //pakeisti kartu su html element
//nesamone... kaip padaryt kad tikrintu ar forma validi pries submitinant
//gal po testavimu pakeisim i submit ir leisim html refreshint tiesiog
//submitLogin.addEventListener("click", attemptLogin);    //gal cia form turetu but o ne button
loginForm.addEventListener("submit", attemptLogin)

function setLoginStatusMsg(message, bErr = true) {
    //if !message - clear, set className to default value which is?
    if(bErr)
        loginStatusMsgElement.className = "loginStatusErr"; //CSS!!!!!! + 3 sec timer to redirect
    else
        loginStatusMsgElement.className = "loginStatusOk";

    loginStatusMsgElement.innerText = message;
}

//perkelti i loginCheck

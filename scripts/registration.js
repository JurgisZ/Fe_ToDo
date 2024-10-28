//patikrinti ar vartotojas nera prisijunges pries registruojant, pasiulyti atsijungti, jei taip

//prisijungimo patikrinimui naudoti atsikra .js faila, kad butu galima pernaudoti keliose vietose
const registrationStatusMsgElement = registrationStatusText;    //innerText


async function apiCreateNewUser(newLoginUserName, newLoginUserPass, newUserEmail) {

    try {
        const response = await fetch(apiUrlAuth, {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                userName: newLoginUserName,
                password: newLoginUserPass,
                email: newUserEmail     //"user@example.com"
            })
        })
        if(response.ok)
        {
            return { success: true };
        }
        else {
            const data = await response.json();
            return {error : data.error}
        }
        
    }
    catch(err) {
        return {error : err};
    }
   
}

async function createNewUser() {
    //check if both password fields match
    //display message (not alert, custom stuff) indicating whether registration was successful or not
    //on success login and go to TODO
    if(userPasswordField1.value === userPasswordField2.value) {
        setRegistrationStatusMsg("Passwords match"); //TEST!
        const userData = await apiCreateNewUser(
            userNameNewField.value,
            userPasswordField1.value,
            userEmailNewField.value
        );
        if(userData.success) {
            //set user data in localStorage
            //enable top bar log out button
            //redirect to ToDo
            setRegistrationStatusMsg(`New user created! Welcome ${userNameNewField.value}!`); //ar is session storage imam?
            //redirectinam i login page, imam user name ir passw is laukeliu ir auto log in.
            document.location.href = indexUrl;
        }
        else {
            //failed set the message
            setRegistrationStatusMsg(userData.error);
        }

    }
    else {
        //TODO: Make custom Red message with border
        //errorMsg
        setRegistrationStatusMsg("Passwords do not match!");    //on submit - clear
    }

}

function setRegistrationStatusMsg(message) {
    registrationStatusMsgElement.innerText = message;
}

//nesamone... kaip padaryt kad tikrintu ar forma validi pries submitinant i API. formos elementa naudot vietoj button?
submitRegistrationBtn.addEventListener("click", createNewUser);


returnToIndexBtn.addEventListener("click", () => {
    document.location.href = indexUrl;
})
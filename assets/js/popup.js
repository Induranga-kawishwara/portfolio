function sendemail() {

    var online = navigator.onLine;
    
    if(online){
        var name = $('#Name').val();
        var email = $('#Email').val();
        var Subject = $('#Subject').val();
        var message = $('#message').val();
    
        var Body = 'Name: ' + name + '<br>Email: ' + email + '<br>Subject: ' + Subject + '<br>Message: ' + message;
    
        Email.send({
            SecureToken : "754a6d56-96c8-40bb-8c10-06665bc83895",
            To : 'induranga.20200688@iit.ac.lk',
            From : 'arunashantha838@gmail.com',
            Subject : "Message from the Portfolio",
            Body : Body
        }).then(
            message => {
                //  alert(message)
                //console.log (message);
                if (message == 'OK') {
    
                    let main = document.getElementById("main");
                    let popup = document.getElementById("popup");
                    main.classList.add("new_main");
                    popup.classList.add("new_pop");
                }
                else {
                    let main = document.getElementById("main");
                    let popup = document.getElementById("error");
                    main.classList.add("new_main");
                    popup.classList.add("new_error");
                }
            }
        );


    }else{
        let main = document.getElementById("main");
        let popup = document.getElementById("error");
        main.classList.add("new_main");
        popup.classList.add("new_error");
    }
}
//ok button of popup window
function Okay(){
    let main = document.getElementById("main");
    let popup = document.getElementById("popup");
    main.classList.remove("new_main");
    popup.classList.remove("new_pop");
    window.location.reload();
}

function error(){
    let main = document.getElementById("main");
    let popup = document.getElementById("error");
    main.classList.remove("new_main");
    popup.classList.remove("new_error");
}
  

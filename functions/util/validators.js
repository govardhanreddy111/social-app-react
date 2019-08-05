const isEmail = (email) =>{
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(email.match(regEx)){
        return true;
    }else return false;
};

const isEmpty = (string) =>{
    if(string.trim() === ''){
        return true;
    }else
        return false;
};

exports.validateSignUpDate = (newUser) =>{
    let errors = {};

    if(isEmpty(newUser.email)){
        errors.email = 'Must not be empty';
    }else if(!isEmail(newUser.email)){
        errors.email = 'Must be valid email Address';
    }

    if(isEmpty(newUser.password)){
        errors.password = 'Must not be empty';
    }

    if(newUser.password !== newUser.confirmPassword){
        errors.confirmPassword = 'Passwords Must Match';
    }

    if(isEmpty(newUser.handle)) errors.handle = 'Must not be Empty';

    return {
        errors,
        valid : Object.keys(errors).length === 0 ? true : false
    }
};

exports.validateLoginData = (user) =>{
    let errors = {};
    if(isEmpty(user.email)) errors.email = 'Must Not be Empty';
    else if(!isEmail(user.email)) errors.email = 'Must be valid Email Address';

    if(isEmpty(user.password)) errors.password = 'Must Not be Empty';

    return {
        errors,
        valid : Object.keys(errors).length === 0 ? true : false
    }
};
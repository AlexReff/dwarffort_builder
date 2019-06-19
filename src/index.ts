require('./css/index.scss');

function component() {
    const element = document.createElement('div');
    
    element.innerHTML = "Hello Webpack"; //_.join(['Hello', 'webpack'], ' ');
    
    return element;
}

document.body.appendChild(component());
![semantify.it](https://semantify.it/images/logo.png)

# Semantify Javascript API Library


### What it is?

This library is responsible for communicating with semantify API service using javascript. 



### Initializing

Just include this script tag in your header.


```html
<script src="./semantify.js"></script>
```


### Javascript Dependencies
This plugin is standalone so it doesn`t depend on any javascript library. But if plugin detects jquery it will use jquery functions instead.




## How to use

At first, you need your website API key, which is necessary to start working with this API library. 
This following code will retrieve the list of annotations from the semantify repository.

```javscript
    var sem = new SemantifyIt("Syi-T1jeb");
    var annotations = sem.getAnnotationList();
    console.log(annotations);
```


